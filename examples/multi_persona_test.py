"""
Example of testing the same flow with multiple personas.
"""

from main_orchestrator import PerformileOrchestrator
from loguru import logger
import json


def run_multi_persona_test():
    """Test the same mission with different personas."""
    
    orchestrator = HitlAIOrchestrator()
    
    test_config = {
        "url": "https://example.com/contact",
        "mission": "Fill out the contact form and submit",
        "platform": "web"
    }
    
    personas = ["senior_casual", "young_power_user", "accessibility_focused"]
    
    results = {}
    
    for persona in personas:
        logger.info(f"\n{'='*80}")
        logger.info(f"Testing with persona: {persona}")
        logger.info(f"{'='*80}\n")
        
        result = orchestrator.run_test(
            url=test_config["url"],
            mission=test_config["mission"],
            persona=persona,
            platform=test_config["platform"]
        )
        
        results[persona] = {
            "success": result['success'],
            "sentiment_score": result.get('sentiment_score'),
            "friction_points": result.get('friction_points'),
            "hitl_required": result.get('hitl_required')
        }
    
    print("\n" + "="*80)
    print("COMPARATIVE ANALYSIS")
    print("="*80)
    
    for persona, data in results.items():
        print(f"\n{persona.upper()}:")
        print(f"  Success: {data['success']}")
        print(f"  Sentiment: {data['sentiment_score']:.2f}/1.0")
        print(f"  Friction Points: {data['friction_points']}")
        print(f"  HITL Required: {data['hitl_required']}")
    
    with open("reports/comparative_analysis.json", "w") as f:
        json.dump(results, f, indent=2)
    
    logger.info("\n📊 Comparative analysis saved to reports/comparative_analysis.json")


if __name__ == "__main__":
    run_multi_persona_test()
