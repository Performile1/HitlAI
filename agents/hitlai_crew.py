"""
HitlAI CrewAI Agent Team - Specialized agents for cognitive testing
"""

from crewai import Agent, Task, Crew
from typing import Dict, Any, List
from loguru import logger


class HitlAIAgentTeam:
    """
    Specialized CrewAI agent team for HitlAI cognitive testing.
    Each agent has a distinct role in the testing workflow.
    """
    
    def __init__(self, driver=None, heuristic_loader=None):
        """
        Initialize the agent team with optional tools.
        
        Args:
            driver: HitlAIDriver instance for automation
            heuristic_loader: HeuristicLoader for UX guidelines
        """
        self.driver = driver
        self.heuristic_loader = heuristic_loader
        
        # Initialize specialized agents
        self.strategist = self._create_strategist()
        self.auditor = self._create_auditor()
        self.executioner = self._create_executioner()
        self.verifier = self._create_verifier()
        
        logger.info("HitlAI Agent Team initialized")
    
    def _create_strategist(self) -> Agent:
        """
        The Strategist: High-level mission planning and decomposition.
        Thinks like a product manager breaking down user journeys.
        """
        return Agent(
            role="Mission Strategist",
            goal="Deconstruct {mission_objective} into logical, testable steps optimized for the {persona} persona.",
            backstory="""You are an expert digital strategist with 15 years of experience in user journey mapping.
            You understand how different demographics approach digital tasks and can break down complex objectives
            into atomic, measurable steps. You consider cognitive load, technical literacy, and accessibility needs
            when planning test missions.""",
            verbose=True,
            allow_delegation=True,
            memory=True
        )
    
    def _create_auditor(self) -> Agent:
        """
        The Auditor: Cognitive UX analysis using Baymard and NN/g heuristics.
        The 'eyes' of the system that identifies friction points.
        """
        return Agent(
            role="Cognitive UX Auditor",
            goal="Identify friction points on the current screen using Baymard Institute and Nielsen Norman Group heuristics, weighted by {persona} characteristics.",
            backstory="""You are a veteran UX researcher with deep expertise in cognitive accessibility and
            e-commerce usability. You've conducted thousands of usability tests and can instantly spot issues
            that will frustrate users. You reference specific guidelines from Baymard and NN/g to support your
            findings. You see the world through the eyes of different personas - from tech-savvy millennials
            to seniors with limited digital literacy.""",
            verbose=True,
            allow_delegation=False,
            memory=True,
            tools=[]  # Will be populated with heuristic_loader methods
        )
    
    def _create_executioner(self) -> Agent:
        """
        The Executioner: Converts plans into precise automation scripts.
        The 'hands' of the system that performs actions.
        """
        return Agent(
            role="Technical Executioner",
            goal="Convert planned test steps into precise, self-healing Playwright/Appium commands that can handle dynamic UIs and recover from failures.",
            backstory="""You are a specialized test automation engineer with expertise in semantic element
            location and self-healing scripts. You excel at finding elements using AI-powered selectors,
            implementing retry logic, and gracefully handling edge cases. You understand that real-world
            UIs are messy and unpredictable, so you build robust automation that adapts to changes.""",
            verbose=True,
            allow_delegation=False,
            memory=True,
            tools=[]  # Will be populated with driver methods
        )
    
    def _create_verifier(self) -> Agent:
        """
        The Verifier: Validates test results and determines success/failure.
        The 'judgment' of the system.
        """
        return Agent(
            role="Test Verifier",
            goal="Validate that the mission objective was achieved and assess the quality of the user experience based on {persona} expectations.",
            backstory="""You are a meticulous QA engineer with a keen eye for detail. You don't just check
            if actions completed - you verify that the outcome matches user intent and that the experience
            was acceptable for the target persona. You can distinguish between technical success and
            user experience success.""",
            verbose=True,
            allow_delegation=False,
            memory=True
        )
    
    def get_planning_crew(self, mission: str, persona: Dict[str, Any], context: str) -> Crew:
        """
        Create a crew for mission planning phase.
        
        Args:
            mission: User's objective (e.g., "Complete checkout")
            persona: Persona configuration dict
            context: Current page context
            
        Returns:
            Crew configured for planning
        """
        task = Task(
            description=f"""
            Mission: {mission}
            Persona: {persona['name']} (Age: {persona.get('age')}, Tech Literacy: {persona.get('tech_literacy')})
            Context: {context[:500]}
            
            Break this mission into 5-10 atomic steps that are:
            1. Specific and actionable
            2. Appropriate for the persona's capabilities
            3. Testable and verifiable
            4. Ordered logically
            
            For each step, specify:
            - Action type (navigate, click, type, verify)
            - Target element description
            - Expected outcome
            - Cognitive considerations for this persona
            """,
            agent=self.strategist,
            expected_output="A structured list of mission steps in JSON format with action details and persona considerations."
        )
        
        return Crew(
            agents=[self.strategist],
            tasks=[task],
            verbose=True
        )
    
    def get_audit_crew(self, persona: Dict[str, Any], current_state: Dict[str, Any]) -> Crew:
        """
        Create a crew for UX auditing phase.
        
        Args:
            persona: Persona configuration dict
            current_state: Current page/screen state
            
        Returns:
            Crew configured for auditing
        """
        # Get relevant heuristics if loader available
        guidelines_context = ""
        if self.heuristic_loader:
            guidelines = self.heuristic_loader.get_relevant_guidelines(
                ui_context=current_state.get('title', '') + ' ' + current_state.get('url', ''),
                persona_name=persona['name'],
                top_k=5
            )
            guidelines_context = "\n\nRelevant UX Guidelines:\n" + "\n".join([
                f"- [{g['heuristic']['id']}] {g['heuristic']['title']}: {g['heuristic']['description']}"
                for g in guidelines
            ])
        
        task = Task(
            description=f"""
            Audit the current UI for a {persona['name']} persona.
            
            Persona Characteristics:
            - Age: {persona.get('age')}
            - Tech Literacy: {persona.get('tech_literacy')}
            - Eyesight: {persona.get('eyesight')}
            - Cognitive Load: {persona.get('cognitive_load')}
            - Attention Rules: {persona.get('attention_rules')}
            
            Current View:
            - URL/Activity: {current_state.get('url', current_state.get('activity', 'Unknown'))}
            - Title: {current_state.get('title', 'N/A')}
            {guidelines_context}
            
            Identify friction points in these categories:
            1. Visibility Issues (contrast, size, hidden elements)
            2. Cognitive Load Problems (complexity, unclear navigation)
            3. Interaction Friction (hard to click, unexpected behavior)
            4. Accessibility Gaps (missing ARIA, poor keyboard nav)
            
            For each friction point, specify:
            - Element description
            - Issue type
            - Severity (low/medium/high/critical)
            - Why this matters for THIS persona
            - Recommended resolution
            - Relevant Baymard/NN/g guideline ID
            """,
            agent=self.auditor,
            expected_output="A structured list of friction points with severity ratings and guideline citations in JSON format."
        )
        
        return Crew(
            agents=[self.auditor],
            tasks=[task],
            verbose=True
        )
    
    def get_execution_crew(
        self,
        step: Dict[str, Any],
        schema: Dict[str, Any],
        audit_results: List[Dict[str, Any]],
        memory_lessons: List[Dict[str, Any]]
    ) -> Crew:
        """
        Create a crew for test execution phase.
        
        Args:
            step: Mission step to execute
            schema: UI schema/structure
            audit_results: Friction points from audit
            memory_lessons: Relevant lessons from past tests
            
        Returns:
            Crew configured for execution
        """
        memory_context = ""
        if memory_lessons:
            memory_context = "\n\nLessons from Past Tests:\n" + "\n".join([
                f"- {lesson.get('lesson_text', '')}: {lesson.get('resolution', '')}"
                for lesson in memory_lessons[:3]
            ])
        
        friction_context = ""
        if audit_results:
            friction_context = "\n\nKnown Friction Points:\n" + "\n".join([
                f"- {fp.get('element', '')}: {fp.get('issue_type', '')} (Severity: {fp.get('severity', '')})"
                for fp in audit_results[:5]
            ])
        
        task = Task(
            description=f"""
            Execute this test step:
            Action: {step.get('action')}
            Target: {step.get('target_element')}
            Expected Outcome: {step.get('validation')}
            
            Available UI Elements:
            {str(schema.get('interactive_elements', []))[:500]}
            {friction_context}
            {memory_context}
            
            Generate a robust automation script that:
            1. Uses semantic selectors (prefer ARIA labels, then text content, then CSS)
            2. Implements retry logic with exponential backoff
            3. Takes screenshots before critical actions
            4. Handles common failure scenarios based on friction points
            5. Returns structured success/failure information
            
            If the target element has known friction (from audit), implement workarounds.
            If similar issues occurred in past tests (from memory), apply those solutions.
            """,
            agent=self.executioner,
            expected_output="A complete automation script with error handling and retry logic."
        )
        
        return Crew(
            agents=[self.executioner],
            tasks=[task],
            verbose=True
        )
    
    def get_verification_crew(
        self,
        mission: str,
        persona: Dict[str, Any],
        execution_results: List[Dict[str, Any]],
        final_state: Dict[str, Any]
    ) -> Crew:
        """
        Create a crew for result verification phase.
        
        Args:
            mission: Original mission objective
            persona: Persona configuration
            execution_results: Results from all execution steps
            final_state: Final page/screen state
            
        Returns:
            Crew configured for verification
        """
        task = Task(
            description=f"""
            Verify mission completion for: {mission}
            Persona: {persona['name']}
            
            Execution Results:
            {str(execution_results)[:1000]}
            
            Final State:
            - URL/Activity: {final_state.get('url', final_state.get('activity', 'Unknown'))}
            - Title: {final_state.get('title', 'N/A')}
            
            Determine:
            1. Was the mission technically completed? (all steps executed successfully)
            2. Was the user experience acceptable for this persona?
            3. What was the overall sentiment (positive/neutral/negative/critical)?
            4. Calculate a sentiment score (0.0-1.0) based on:
               - Step success rate
               - Number of retries needed
               - Friction points encountered
               - Time taken vs expected
            5. What lessons should be stored for future tests?
            
            Provide a comprehensive assessment with specific evidence.
            """,
            agent=self.verifier,
            expected_output="A verification report with success status, sentiment score, and lessons learned in JSON format."
        )
        
        return Crew(
            agents=[self.verifier],
            tasks=[task],
            verbose=True
        )


# Example usage
if __name__ == "__main__":
    team = HitlAIAgentTeam()
    
    # Test planning crew
    persona = {
        "name": "senior_casual",
        "age": 70,
        "tech_literacy": "low",
        "eyesight": "low_contrast_sensitive",
        "cognitive_load": "low"
    }
    
    crew = team.get_planning_crew(
        mission="Complete newsletter signup",
        persona=persona,
        context="Homepage with newsletter form in footer"
    )
    
    print("Planning crew created successfully")
