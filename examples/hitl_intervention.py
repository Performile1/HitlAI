"""
Example of handling HITL (Human-in-the-Loop) interventions.
"""

from main_orchestrator import PerformileOrchestrator
from loguru import logger


def run_test_with_hitl():
    """Run a test that may require human intervention."""
    
    orchestrator = HitlAIOrchestrator()
    
    result = orchestrator.run_test(
        url="https://example.com/complex-form",
        mission="Complete the multi-step registration form",
        persona="senior_casual",
        platform="web"
    )
    
    if result.get('hitl_required'):
        logger.warning("🚨 HITL Interrupt Triggered!")
        logger.info("The agent needs your help to proceed.")
        
        print("\n" + "="*80)
        print("HUMAN INTERVENTION REQUIRED")
        print("="*80)
        print("\nThe agent has failed 3 times and needs guidance.")
        print("Please review the screenshots and provide feedback.\n")
        
        feedback = input("Enter your guidance (e.g., 'Use the blue button in the footer'): ")
        
        if feedback:
            logger.info(f"Providing feedback: {feedback}")
            
            final_result = orchestrator.provide_hitl_feedback(
                thread_id=result.get('thread_id', result['url']),
                feedback=feedback
            )
            
            logger.info("✅ Agent resumed with your guidance")
            print("\n" + "="*80)
            print(final_result.get('final_report', 'Test completed'))
            print("="*80)
        else:
            logger.warning("No feedback provided. Test remains paused.")
    
    elif result['success']:
        logger.info("✅ Test completed without intervention!")
        print("\n" + result['report'])
    
    else:
        logger.error(f"❌ Test failed: {result.get('error')}")


if __name__ == "__main__":
    run_test_with_hitl()
