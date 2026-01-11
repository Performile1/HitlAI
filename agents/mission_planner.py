from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import List, Dict
import os
from loguru import logger


class MissionPlanner:
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7,
            max_tokens=4096
        )
        
        self.agent = Agent(
            role="Test Mission Strategist",
            goal="Break down complex user journeys into testable steps that align with persona capabilities",
            backstory="""You are an expert test architect who understands how to decompose 
            user journeys into atomic, testable steps. You consider persona limitations, 
            cognitive load, and real-world user behavior patterns when planning test missions.""",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_planning_task(
        self,
        user_objective: str,
        persona_config: Dict,
        crawl_context: str
    ) -> Task:
        task_description = f"""
        Create a detailed test mission plan for this objective:
        
        **User Objective**: {user_objective}
        
        **Persona Context**:
        - Age: {persona_config.get('age')}
        - Tech Literacy: {persona_config.get('tech_literacy')}
        - Cognitive Load: {persona_config.get('cognitive_load')}
        - Navigation Preference: {persona_config.get('preferred_navigation')}
        
        **Page Context**:
        {crawl_context[:2000]}
        
        Break down the objective into a sequence of atomic steps that:
        1. Align with the persona's capabilities and limitations
        2. Follow natural user behavior patterns
        3. Are independently testable and verifiable
        4. Include checkpoints for validation
        5. Consider cognitive load at each step
        
        Return a JSON structure:
        {{
            "mission_name": "descriptive name",
            "mission_description": "what we're testing and why",
            "steps": [
                {{
                    "step_number": 1,
                    "action": "specific action to take",
                    "target_element": "what to interact with",
                    "validation": "how to verify success",
                    "cognitive_notes": "persona considerations"
                }}
            ],
            "success_criteria": ["list of overall success indicators"],
            "failure_scenarios": ["potential failure points to watch"]
        }}
        """
        
        return Task(
            description=task_description,
            agent=self.agent,
            expected_output="Structured JSON mission plan with atomic steps"
        )
    
    def parse_mission_plan(self, plan_output: str) -> Dict:
        import json
        import re
        
        try:
            json_match = re.search(r'\{.*\}', plan_output, re.DOTALL)
            if json_match:
                plan_data = json.loads(json_match.group())
            else:
                plan_data = json.loads(plan_output)
            
            return {
                "mission_name": plan_data.get("mission_name", "Unnamed Mission"),
                "mission_description": plan_data.get("mission_description", ""),
                "steps": [step["action"] for step in plan_data.get("steps", [])],
                "success_criteria": plan_data.get("success_criteria", []),
                "failure_scenarios": plan_data.get("failure_scenarios", [])
            }
            
        except Exception as e:
            logger.error(f"Failed to parse mission plan: {str(e)}")
            return {
                "mission_name": "Fallback Mission",
                "mission_description": user_objective,
                "steps": [user_objective],
                "success_criteria": [],
                "failure_scenarios": []
            }
