"""
Example of querying the vector memory store for lessons learned.
"""

from memory.vector_store import VectorMemoryStore
from loguru import logger


def query_memory():
    """Query the memory store for relevant lessons."""
    
    memory = VectorMemoryStore()
    
    queries = [
        "button not clickable on mobile",
        "form validation errors",
        "navigation menu hidden",
        "slow page load times"
    ]
    
    print("\n" + "="*80)
    print("MEMORY QUERY RESULTS")
    print("="*80)
    
    for query in queries:
        print(f"\n🔍 Query: {query}")
        print("-" * 80)
        
        lessons = memory.retrieve_similar_lessons(
            query=query,
            top_k=3
        )
        
        if lessons:
            for idx, lesson in enumerate(lessons, 1):
                metadata = lesson['metadata']
                print(f"\n  {idx}. Similarity: {lesson['score']:.3f}")
                print(f"     Platform: {metadata.get('platform', 'N/A')}")
                print(f"     URL: {metadata.get('url', 'N/A')}")
                print(f"     Friction: {metadata.get('friction_type', 'N/A')}")
                print(f"     Lesson: {metadata.get('lesson_text', 'N/A')[:100]}...")
                print(f"     Resolution: {metadata.get('resolution', 'N/A')[:100]}...")
        else:
            print("  No relevant lessons found.")
    
    print("\n" + "="*80)


def check_cross_platform():
    """Check for cross-platform friction patterns."""
    
    memory = VectorMemoryStore()
    
    print("\n" + "="*80)
    print("CROSS-PLATFORM FRICTION CHECK")
    print("="*80)
    
    result = memory.check_cross_platform_friction(
        url="https://example.com",
        element_description="submit button",
        current_platform="web"
    )
    
    if result:
        print("\n⚠️  Similar friction found on mobile platform!")
        print(f"Friction Type: {result['metadata'].get('friction_type')}")
        print(f"Lesson: {result['metadata'].get('lesson_text')}")
        print(f"Resolution: {result['metadata'].get('resolution')}")
    else:
        print("\n✅ No cross-platform friction detected.")
    
    print("\n" + "="*80)


def store_manual_lesson():
    """Manually store a lesson in memory."""
    
    memory = VectorMemoryStore()
    
    lesson_id = memory.store_lesson(
        lesson_text="The checkout button was hidden behind a modal overlay on mobile devices. Users with low tech literacy couldn't find it.",
        url="https://example.com/checkout",
        platform="mobile",
        friction_type="visibility",
        resolution="Moved the button above the modal z-index and increased size to 48x48px",
        metadata={
            "severity": "high",
            "persona_affected": "senior_casual",
            "fix_verified": True
        }
    )
    
    logger.info(f"✅ Lesson stored with ID: {lesson_id}")
    
    lessons = memory.retrieve_similar_lessons(
        query="button hidden on mobile",
        platform="mobile",
        top_k=1
    )
    
    if lessons:
        print("\n✅ Verification: Lesson can be retrieved!")
        print(f"Similarity Score: {lessons[0]['score']:.3f}")


if __name__ == "__main__":
    print("\n1. Querying memory for lessons...")
    query_memory()
    
    print("\n2. Checking cross-platform friction...")
    check_cross_platform()
    
    print("\n3. Storing a manual lesson...")
    store_manual_lesson()
