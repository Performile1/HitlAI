from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from typing import Dict, List, Optional
import os
from loguru import logger


class TechnicalExecutor:
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1") if os.getenv("DEEPSEEK_API_KEY") else None,
            temperature=0.3,
            max_tokens=8192
        )
        
        self.agent = Agent(
            role="Playwright Automation Engineer",
            goal="Generate robust, self-healing Playwright scripts that can handle dynamic UIs and recover from failures",
            backstory="""You are an expert in browser automation with deep knowledge of 
            Playwright, CSS selectors, XPath, and modern web technologies. You specialize 
            in creating resilient automation scripts that can adapt to UI changes and 
            handle edge cases gracefully. You understand semantic HTML and can leverage 
            accessibility attributes for reliable element selection.""",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_script_generation_task(
        self,
        mission: str,
        semantic_schema: Dict,
        audit_results: Dict,
        memory_lessons: List[Dict],
        previous_failures: List[Dict] = None
    ) -> Task:
        memory_context = ""
        if memory_lessons:
            memory_context = "\n\nLessons from Previous Attempts:\n"
            for lesson in memory_lessons[:3]:
                memory_context += f"- {lesson['metadata'].get('lesson_text', '')}\n"
                memory_context += f"  Resolution: {lesson['metadata'].get('resolution', '')}\n"
        
        failure_context = ""
        if previous_failures:
            failure_context = "\n\nPrevious Failures to Avoid:\n"
            for failure in previous_failures[-3:]:
                failure_context += f"- Selector: {failure.get('selector', 'N/A')}\n"
                failure_context += f"  Error: {failure.get('error_message', 'N/A')}\n"
        
        task_description = f"""
        Generate a robust Playwright script to accomplish this mission:
        
        **Mission**: {mission}
        
        **Available UI Elements** (from semantic schema):
        {str(semantic_schema.get('interactive_elements', []))[:2000]}
        
        **UX Audit Insights**:
        {str(audit_results.get('summary', ''))[:1000]}
        
        Blocking Issues to Navigate Around:
        {', '.join(audit_results.get('blocking_issues', []))}
        
        {memory_context}
        {failure_context}
        
        **Requirements**:
        
        1. **Selector Strategy** (in order of preference):
           - Use ARIA labels and roles first (most stable)
           - Use data-testid or data-* attributes
           - Use semantic HTML (button, nav, main, etc.)
           - Use text content with getByText/getByRole
           - CSS selectors as last resort
        
        2. **Self-Healing Patterns**:
           - Implement multiple fallback selectors for each element
           - Use waitForSelector with reasonable timeouts
           - Add retry logic with exponential backoff
           - Take screenshots before critical actions
           - Log detailed error context
        
        3. **Error Handling**:
           - Wrap actions in try-catch blocks
           - Return structured error information
           - Capture page state on failure
           - Suggest alternative approaches
        
        4. **Accessibility-First**:
           - Prefer keyboard navigation where applicable
           - Check for focus indicators
           - Verify ARIA states after actions
        
        Generate a complete Python script using Playwright async API with this structure:
        
        ```python
        from playwright.async_api import async_playwright, Page
        import asyncio
        from typing import Dict
        
        async def execute_mission(url: str) -> Dict:
            result = {{
                "success": False,
                "steps_completed": [],
                "error": None,
                "screenshots": [],
                "suggestions": []
            }}
            
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=False)
                context = await browser.new_context(
                    viewport={{"width": 1280, "height": 720}}
                )
                page = await context.new_page()
                
                try:
                    # Your implementation here
                    pass
                    
                finally:
                    await browser.close()
            
            return result
        ```
        
        Return ONLY the complete Python script, no explanations.
        """
        
        return Task(
            description=task_description,
            agent=self.agent,
            expected_output="Complete executable Playwright Python script"
        )
    
    def extract_script(self, task_output: str) -> str:
        import re
        
        code_block_match = re.search(r'```python\n(.*?)\n```', task_output, re.DOTALL)
        if code_block_match:
            return code_block_match.group(1)
        
        code_block_match = re.search(r'```\n(.*?)\n```', task_output, re.DOTALL)
        if code_block_match:
            return code_block_match.group(1)
        
        if 'async def execute_mission' in task_output:
            return task_output
        
        logger.warning("Could not extract clean script, returning raw output")
        return task_output
