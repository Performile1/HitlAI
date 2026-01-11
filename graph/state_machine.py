from typing import Annotated, Sequence
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
import json
from loguru import logger
from config.state_schema import AgentState, PersonaConfig
from memory.vector_store import VectorMemoryStore
from integrations.crawl_scout import CrawlScout
from integrations.scrape_mapper import ScrapeMapper
from agents.vision_specialist import VisionSpecialist
from agents.technical_executor import TechnicalExecutor
from agents.mission_planner import MissionPlanner
from crewai import Crew
import os


class HitlAIStateMachine:
    
    def __init__(self):
        self.memory_store = VectorMemoryStore()
        self.crawl_scout = CrawlScout()
        self.scrape_mapper = ScrapeMapper()
        self.vision_specialist = VisionSpecialist()
        self.technical_executor = TechnicalExecutor()
        self.mission_planner = MissionPlanner()
        
        self.hitl_threshold = int(os.getenv("HITL_INTERRUPT_THRESHOLD", "3"))
        
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(AgentState)
        
        workflow.add_node("load_persona", self.load_persona_node)
        workflow.add_node("plan_mission", self.plan_mission_node)
        workflow.add_node("retrieve_memory", self.retrieve_memory_node)
        workflow.add_node("scout_page", self.scout_page_node)
        workflow.add_node("map_schema", self.map_schema_node)
        workflow.add_node("audit_ux", self.audit_ux_node)
        workflow.add_node("generate_script", self.generate_script_node)
        workflow.add_node("execute_action", self.execute_action_node)
        workflow.add_node("check_hitl", self.check_hitl_node)
        workflow.add_node("await_human", self.await_human_node)
        workflow.add_node("learn_lesson", self.learn_lesson_node)
        workflow.add_node("generate_report", self.generate_report_node)
        
        workflow.set_entry_point("load_persona")
        
        workflow.add_edge("load_persona", "plan_mission")
        workflow.add_edge("plan_mission", "retrieve_memory")
        workflow.add_edge("retrieve_memory", "scout_page")
        workflow.add_edge("scout_page", "map_schema")
        workflow.add_edge("map_schema", "audit_ux")
        workflow.add_edge("audit_ux", "generate_script")
        workflow.add_edge("generate_script", "execute_action")
        workflow.add_edge("execute_action", "check_hitl")
        
        workflow.add_conditional_edges(
            "check_hitl",
            self.should_interrupt_for_human,
            {
                "await_human": "await_human",
                "continue": "generate_report",
                "retry": "generate_script"
            }
        )
        
        workflow.add_edge("await_human", "learn_lesson")
        workflow.add_edge("learn_lesson", "generate_script")
        workflow.add_edge("generate_report", END)
        
        return workflow.compile(checkpointer=MemorySaver())
    
    def load_persona_node(self, state: AgentState) -> AgentState:
        logger.info(f"Loading persona: {state['persona']}")
        
        persona_file = ".windsurf/persona_registry.json"
        with open(persona_file, 'r') as f:
            personas = json.load(f)
        
        persona_data = personas.get(state['persona'], personas.get('senior_casual'))
        
        state['persona_config'] = PersonaConfig(**persona_data)
        state['messages'].append({
            "role": "system",
            "content": f"Loaded persona: {state['persona']}"
        })
        
        return state
    
    def plan_mission_node(self, state: AgentState) -> AgentState:
        logger.info("Planning mission...")
        
        task = self.mission_planner.create_planning_task(
            user_objective=state['current_mission'],
            persona_config=state['persona_config'].dict(),
            crawl_context=state.get('crawl_context', '')
        )
        
        crew = Crew(
            agents=[self.mission_planner.agent],
            tasks=[task],
            verbose=True
        )
        
        result = crew.kickoff()
        plan = self.mission_planner.parse_mission_plan(str(result))
        
        state['mission_steps'] = plan['steps']
        state['current_step_index'] = 0
        state['messages'].append({
            "role": "planner",
            "content": f"Mission planned: {plan['mission_name']}"
        })
        
        return state
    
    def retrieve_memory_node(self, state: AgentState) -> AgentState:
        logger.info("Retrieving memory for cross-platform insights...")
        
        query = f"friction on {state['url']} for {state['persona']}"
        lessons = self.memory_store.retrieve_similar_lessons(
            query=query,
            platform=state['platform'],
            top_k=5
        )
        
        cross_platform_check = self.memory_store.check_cross_platform_friction(
            url=state['url'],
            element_description=state['current_mission'],
            current_platform=state['platform']
        )
        
        if cross_platform_check:
            logger.warning(f"Cross-platform friction detected: {cross_platform_check['metadata']['friction_type']}")
            lessons.insert(0, cross_platform_check)
        
        state['memory_retrieved'] = lessons
        state['messages'].append({
            "role": "memory",
            "content": f"Retrieved {len(lessons)} relevant lessons from memory"
        })
        
        return state
    
    def scout_page_node(self, state: AgentState) -> AgentState:
        logger.info(f"Scouting page: {state['url']}")
        
        scan_result = self.crawl_scout.scan_site_sync(state['url'])
        
        if scan_result['success']:
            state['crawl_context'] = scan_result['fit_markdown']
            state['messages'].append({
                "role": "scout",
                "content": f"Page scanned successfully. Markdown length: {len(scan_result['fit_markdown'])}"
            })
        else:
            logger.error(f"Scout failed: {scan_result.get('error')}")
            state['messages'].append({
                "role": "scout",
                "content": f"Scout failed: {scan_result.get('error')}"
            })
        
        return state
    
    def map_schema_node(self, state: AgentState) -> AgentState:
        logger.info("Mapping semantic schema...")
        
        schema = self.scrape_mapper.map_semantic_schema(
            url=state['url'],
            html_content=state.get('crawl_context')
        )
        
        state['semantic_schema'] = schema
        state['messages'].append({
            "role": "mapper",
            "content": f"Schema mapped. Found {len(schema.get('interactive_elements', []))} interactive elements"
        })
        
        return state
    
    def audit_ux_node(self, state: AgentState) -> AgentState:
        logger.info("Auditing UX with Vision Specialist...")
        
        task = self.vision_specialist.create_audit_task(
            persona_config=state['persona_config'],
            semantic_schema=state['semantic_schema'],
            crawl_context=state['crawl_context']
        )
        
        crew = Crew(
            agents=[self.vision_specialist.agent],
            tasks=[task],
            verbose=True
        )
        
        result = crew.kickoff()
        audit_results = self.vision_specialist.parse_audit_results(str(result))
        
        state['audit_results'] = audit_results
        state['friction_points'].extend(audit_results['friction_points'])
        state['sentiment_score'] = audit_results['sentiment_score']
        
        state['messages'].append({
            "role": "auditor",
            "content": f"Audit complete. Found {len(audit_results['friction_points'])} friction points"
        })
        
        return state
    
    def generate_script_node(self, state: AgentState) -> AgentState:
        logger.info("Generating Playwright script...")
        
        current_step = state['mission_steps'][state['current_step_index']]
        
        task = self.technical_executor.create_script_generation_task(
            mission=current_step,
            semantic_schema=state['semantic_schema'],
            audit_results=state['audit_results'],
            memory_lessons=state['memory_retrieved'],
            previous_failures=state['action_attempts'][-3:] if state['action_attempts'] else None
        )
        
        crew = Crew(
            agents=[self.technical_executor.agent],
            tasks=[task],
            verbose=True
        )
        
        result = crew.kickoff()
        script = self.technical_executor.extract_script(str(result))
        
        state['playwright_script'] = script
        state['messages'].append({
            "role": "executor",
            "content": "Playwright script generated"
        })
        
        return state
    
    def execute_action_node(self, state: AgentState) -> AgentState:
        logger.info("Executing Playwright action...")
        
        try:
            exec_globals = {}
            exec(state['playwright_script'], exec_globals)
            
            import asyncio
            execute_mission = exec_globals.get('execute_mission')
            
            if execute_mission:
                result = asyncio.run(execute_mission(state['url']))
                
                from datetime import datetime
                from config.state_schema import ActionAttempt
                
                attempt = ActionAttempt(
                    timestamp=datetime.utcnow(),
                    action_type="playwright_execution",
                    selector=state['mission_steps'][state['current_step_index']],
                    success=result.get('success', False),
                    error_message=result.get('error')
                )
                
                state['action_attempts'].append(attempt)
                state['execution_result'] = result
                
                if result.get('success'):
                    state['failure_count'] = 0
                    state['current_step_index'] += 1
                else:
                    state['failure_count'] += 1
                
                state['messages'].append({
                    "role": "executor",
                    "content": f"Execution {'succeeded' if result.get('success') else 'failed'}"
                })
            else:
                raise Exception("execute_mission function not found in script")
                
        except Exception as e:
            logger.error(f"Execution error: {str(e)}")
            state['failure_count'] += 1
            state['messages'].append({
                "role": "executor",
                "content": f"Execution error: {str(e)}"
            })
        
        return state
    
    def check_hitl_node(self, state: AgentState) -> AgentState:
        if state['failure_count'] >= self.hitl_threshold:
            state['hitl_interrupt'] = True
            logger.warning(f"HITL interrupt triggered after {state['failure_count']} failures")
        
        return state
    
    def should_interrupt_for_human(self, state: AgentState) -> str:
        if state['hitl_interrupt'] and not state.get('hitl_feedback'):
            return "await_human"
        
        if state['current_step_index'] >= len(state['mission_steps']):
            return "continue"
        
        if state['failure_count'] > 0 and state['failure_count'] < self.hitl_threshold:
            return "retry"
        
        return "continue"
    
    def await_human_node(self, state: AgentState) -> AgentState:
        logger.info("Awaiting human intervention...")
        
        state['messages'].append({
            "role": "system",
            "content": "HITL interrupt: Awaiting human feedback"
        })
        
        return state
    
    def learn_lesson_node(self, state: AgentState) -> AgentState:
        logger.info("Learning from human feedback...")
        
        if state.get('hitl_feedback'):
            lesson_text = f"Mission: {state['current_mission']}\n"
            lesson_text += f"Failure: {state['action_attempts'][-1].error_message}\n"
            lesson_text += f"Human Resolution: {state['hitl_feedback']}"
            
            self.memory_store.store_lesson(
                lesson_text=lesson_text,
                url=state['url'],
                platform=state['platform'],
                friction_type="hitl_intervention",
                resolution=state['hitl_feedback']
            )
            
            state['failure_count'] = 0
            state['hitl_interrupt'] = False
            state['messages'].append({
                "role": "memory",
                "content": "Lesson learned and stored in memory"
            })
        
        return state
    
    def generate_report_node(self, state: AgentState) -> AgentState:
        logger.info("Generating final report...")
        
        report = f"""
# Performile Cognitive Testing Report

**URL**: {state['url']}
**Platform**: {state['platform']}
**Persona**: {state['persona']}
**Mission**: {state['current_mission']}

## Executive Summary
- **Sentiment Score**: {state.get('sentiment_score', 0.5):.2f}/1.0
- **Friction Points Identified**: {len(state['friction_points'])}
- **Steps Completed**: {state['current_step_index']}/{len(state['mission_steps'])}
- **HITL Interventions**: {1 if state.get('hitl_feedback') else 0}

## Friction Points

"""
        
        for fp in state['friction_points']:
            report += f"### {fp.severity.upper()}: {fp.element}\n"
            report += f"- **Issue Type**: {fp.issue_type}\n"
            report += f"- **Persona Impact**: {fp.persona_impact}\n"
            report += f"- **Resolution**: {fp.resolution or 'Pending'}\n\n"
        
        report += f"""
## Memory Insights
- **Lessons Retrieved**: {len(state['memory_retrieved'])}
- **Cross-Platform Issues**: {'Yes' if any(m['metadata'].get('platform') != state['platform'] for m in state['memory_retrieved']) else 'No'}

## Execution Summary
- **Total Attempts**: {len(state['action_attempts'])}
- **Success Rate**: {sum(1 for a in state['action_attempts'] if a.success) / len(state['action_attempts']) * 100 if state['action_attempts'] else 0:.1f}%

---
*Report generated by Performile Cognitive Testing Agent*
*Intellectual Property of Rickard Wigrund*
"""
        
        state['final_report'] = report
        state['messages'].append({
            "role": "system",
            "content": "Report generated"
        })
        
        return state
    
    def run(self, initial_state: dict) -> AgentState:
        config = {"configurable": {"thread_id": initial_state.get('url', 'default')}}
        
        final_state = self.graph.invoke(initial_state, config)
        
        return final_state
