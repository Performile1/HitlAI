"""
Basic example of running a Performile cognitive test.
"""

from main_orchestrator import HitlAIOrchestrator
from loguru import logger


def run_basic_test():
    """Run a simple test on a website."""
    
    orchestrator = PerformileOrchestrator()
    
    result = orchestrator.run_test(
        url="https://example.com",
        mission="Navigate to the 'More information' link and verify the page loads",
        persona="senior_casual",
        platform="web"
    )
    
    if result['success']:
        logger.info("✅ Test completed successfully!")
        logger.info(f"📊 Sentiment Score: {result['sentiment_score']:.2f}/1.0")
        logger.info(f"⚠️  Friction Points: {result['friction_points']}")
        
        print("\n" + "="*80)
        print(result['report'])
        print("="*80)
    else:
        logger.error(f"❌ Test failed: {result['error']}")


if __name__ == "__main__":
    run_basic_test()
