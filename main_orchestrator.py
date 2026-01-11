import os
import sys
import json
from typing import Optional
from dotenv import load_dotenv
from loguru import logger
from datetime import datetime

from graph.state_machine import PerformileStateMachine
from config.state_schema import AgentState

load_dotenv()

logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/performile_{time}.log",
    rotation="500 MB",
    retention="10 days",
    level="DEBUG"
)


class PerformileOrchestrator:
    
    def __init__(self):
        self._validate_environment()
        self.state_machine = PerformileStateMachine()
        logger.info("Performile Orchestrator initialized")
    
    def _validate_environment(self):
        required_vars = [
            "OPENAI_API_KEY",
            "ANTHROPIC_API_KEY",
            "PINECONE_API_KEY"
        ]
        
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            logger.warning(f"Missing environment variables: {', '.join(missing)}")
            logger.warning("Some features may not work. Please configure .env file.")
    
    def run_test(
        self,
        url: str,
        mission: str,
        persona: str = "senior_casual",
        platform: str = "web"
    ) -> dict:
        logger.info(f"Starting test mission: {mission}")
        logger.info(f"Target: {url} | Platform: {platform} | Persona: {persona}")
        
        initial_state: AgentState = {
            "url": url,
            "platform": platform,
            "persona": persona,
            "persona_config": None,
            "crawl_context": None,
            "semantic_schema": None,
            "current_mission": mission,
            "mission_steps": [],
            "current_step_index": 0,
            "action_attempts": [],
            "failure_count": 0,
            "hitl_interrupt": False,
            "hitl_feedback": None,
            "friction_points": [],
            "memory_retrieved": [],
            "audit_results": None,
            "playwright_script": None,
            "execution_result": None,
            "final_report": None,
            "sentiment_score": None,
            "messages": [],
            "next_action": None
        }
        
        try:
            final_state = self.state_machine.run(initial_state)
            
            self._save_report(final_state)
            
            return {
                "success": True,
                "report": final_state.get('final_report'),
                "sentiment_score": final_state.get('sentiment_score'),
                "friction_points": len(final_state.get('friction_points', [])),
                "hitl_required": final_state.get('hitl_interrupt', False)
            }
            
        except Exception as e:
            logger.error(f"Test execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _save_report(self, state: AgentState):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_dir = "reports"
        os.makedirs(report_dir, exist_ok=True)
        
        report_file = os.path.join(
            report_dir,
            f"report_{state['persona']}_{state['platform']}_{timestamp}.md"
        )
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(state.get('final_report', 'No report generated'))
        
        logger.info(f"Report saved to: {report_file}")
        
        state_file = os.path.join(
            report_dir,
            f"state_{state['persona']}_{state['platform']}_{timestamp}.json"
        )
        
        state_dict = {
            "url": state['url'],
            "platform": state['platform'],
            "persona": state['persona'],
            "mission": state['current_mission'],
            "sentiment_score": state.get('sentiment_score'),
            "friction_points": [
                {
                    "element": fp.element,
                    "issue_type": fp.issue_type,
                    "severity": fp.severity,
                    "persona_impact": fp.persona_impact
                }
                for fp in state.get('friction_points', [])
            ],
            "execution_summary": {
                "total_attempts": len(state.get('action_attempts', [])),
                "successful_attempts": sum(1 for a in state.get('action_attempts', []) if a.success),
                "hitl_interventions": 1 if state.get('hitl_feedback') else 0
            }
        }
        
        with open(state_file, 'w', encoding='utf-8') as f:
            json.dump(state_dict, f, indent=2)
        
        logger.info(f"State saved to: {state_file}")
    
    def provide_hitl_feedback(self, thread_id: str, feedback: str):
        logger.info(f"Receiving HITL feedback for thread: {thread_id}")
        
        config = {"configurable": {"thread_id": thread_id}}
        
        current_state = self.state_machine.graph.get_state(config)
        
        current_state.values['hitl_feedback'] = feedback
        current_state.values['hitl_interrupt'] = False
        
        self.state_machine.graph.update_state(config, current_state.values)
        
        final_state = self.state_machine.graph.invoke(None, config)
        
        return final_state


def main():
    orchestrator = HitlAIOrchestrator()
    
    result = orchestrator.run_test(
        url="https://example.com",
        mission="Navigate to the contact page and fill out the contact form",
        persona="senior_casual",
        platform="web"
    )
    
    if result['success']:
        logger.info("Test completed successfully!")
        logger.info(f"Sentiment Score: {result['sentiment_score']}")
        logger.info(f"Friction Points: {result['friction_points']}")
        print("\n" + "="*80)
        print(result['report'])
        print("="*80)
    else:
        logger.error(f"Test failed: {result['error']}")


if __name__ == "__main__":
    main()
