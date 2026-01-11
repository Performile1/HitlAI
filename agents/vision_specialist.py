from crewai import Agent, Task
from langchain_anthropic import ChatAnthropic
from typing import Dict, List
import os
from loguru import logger
from config.state_schema import PersonaConfig, FrictionPoint
from datetime import datetime


class VisionSpecialist:
    
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20240620",
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=0.5,
            max_tokens=4096
        )
        
        self.agent = Agent(
            role="UX Cognitive Auditor",
            goal="Audit user interfaces for cognitive accessibility and usability issues based on persona requirements",
            backstory="""You are an expert in cognitive psychology and UX design with deep 
            understanding of how different user personas interact with digital interfaces. 
            You specialize in identifying friction points that cause confusion, frustration, 
            or abandonment, particularly for users with varying levels of tech literacy and 
            cognitive abilities.""",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_audit_task(
        self,
        persona_config: PersonaConfig,
        semantic_schema: Dict,
        crawl_context: str,
        screenshot_path: str = None
    ) -> Task:
        persona_description = f"""
        Persona Profile:
        - Age: {persona_config.age}
        - Tech Literacy: {persona_config.tech_literacy}
        - Eyesight: {persona_config.eyesight}
        - Cognitive Load Tolerance: {persona_config.cognitive_load}
        - Preferred Navigation: {persona_config.preferred_navigation}
        - Reading Level: {persona_config.reading_level}
        
        Attention Rules:
        {chr(10).join(f'- {rule}' for rule in persona_config.attention_rules)}
        """
        
        task_description = f"""
        Conduct a comprehensive cognitive UX audit of the interface with this persona:
        
        {persona_description}
        
        Page Context (Fit Markdown):
        {crawl_context[:3000]}
        
        Semantic Schema:
        {str(semantic_schema)[:2000]}
        
        Your audit must identify:
        
        1. **Visibility Issues**
           - Elements that are hard to see for this persona
           - Poor contrast ratios
           - Small text or touch targets
           - Hidden or unclear interactive elements
        
        2. **Cognitive Load Problems**
           - Information overload
           - Unclear navigation paths
           - Inconsistent UI patterns
           - Confusing terminology
        
        3. **Interaction Friction**
           - Hard-to-click elements
           - Unexpected behaviors
           - Missing feedback
           - Complex multi-step processes
        
        4. **Accessibility Gaps**
           - Missing ARIA labels
           - Poor keyboard navigation
           - Inadequate focus indicators
           - Screen reader issues
        
        5. **Persona-Specific Concerns**
           - Issues that would particularly affect this persona
           - Violations of their attention rules
           - Mismatches with their navigation preferences
        
        Return a structured JSON with:
        {{
            "friction_points": [
                {{
                    "element": "specific element description",
                    "issue_type": "visibility|cognitive_load|interaction|accessibility",
                    "severity": "low|medium|high|critical",
                    "persona_impact": "why this matters for this persona",
                    "recommendation": "how to fix it"
                }}
            ],
            "overall_sentiment": "positive|neutral|negative|critical",
            "sentiment_score": 0.0-1.0,
            "blocking_issues": ["list of issues that prevent task completion"],
            "summary": "brief overall assessment"
        }}
        """
        
        return Task(
            description=task_description,
            agent=self.agent,
            expected_output="Structured JSON audit report with friction points and recommendations"
        )
    
    def parse_audit_results(self, audit_output: str) -> Dict:
        import json
        import re
        
        try:
            json_match = re.search(r'\{.*\}', audit_output, re.DOTALL)
            if json_match:
                audit_data = json.loads(json_match.group())
            else:
                audit_data = json.loads(audit_output)
            
            friction_points = []
            for fp in audit_data.get("friction_points", []):
                friction_points.append(FrictionPoint(
                    element=fp["element"],
                    issue_type=fp["issue_type"],
                    severity=fp["severity"],
                    persona_impact=fp["persona_impact"],
                    platform="web",
                    timestamp=datetime.utcnow(),
                    resolution=fp.get("recommendation")
                ))
            
            return {
                "friction_points": friction_points,
                "overall_sentiment": audit_data.get("overall_sentiment", "neutral"),
                "sentiment_score": audit_data.get("sentiment_score", 0.5),
                "blocking_issues": audit_data.get("blocking_issues", []),
                "summary": audit_data.get("summary", "")
            }
            
        except Exception as e:
            logger.error(f"Failed to parse audit results: {str(e)}")
            return {
                "friction_points": [],
                "overall_sentiment": "neutral",
                "sentiment_score": 0.5,
                "blocking_issues": [],
                "summary": f"Audit parsing failed: {str(e)}"
            }
