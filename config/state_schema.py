from typing import TypedDict, List, Dict, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class PersonaConfig(BaseModel):
    age: int
    tech_literacy: str
    eyesight: str
    attention_rules: List[str]
    cognitive_load: str
    preferred_navigation: str
    reading_level: str


class ActionAttempt(BaseModel):
    timestamp: datetime
    action_type: str
    selector: str
    success: bool
    error_message: Optional[str] = None
    screenshot_path: Optional[str] = None


class FrictionPoint(BaseModel):
    element: str
    issue_type: str
    severity: Literal["low", "medium", "high", "critical"]
    persona_impact: str
    platform: str
    timestamp: datetime
    resolution: Optional[str] = None


class MemoryEntry(BaseModel):
    id: str
    vector: List[float]
    metadata: Dict
    timestamp: datetime
    platform: str
    url: str
    lesson_learned: str


class AgentState(TypedDict):
    url: str
    platform: Literal["web", "mobile"]
    persona: str
    persona_config: PersonaConfig
    
    crawl_context: Optional[str]
    semantic_schema: Optional[Dict]
    
    current_mission: str
    mission_steps: List[str]
    current_step_index: int
    
    action_attempts: List[ActionAttempt]
    failure_count: int
    hitl_interrupt: bool
    hitl_feedback: Optional[str]
    
    friction_points: List[FrictionPoint]
    memory_retrieved: List[MemoryEntry]
    
    audit_results: Optional[Dict]
    playwright_script: Optional[str]
    execution_result: Optional[Dict]
    
    final_report: Optional[str]
    sentiment_score: Optional[float]
    
    messages: List[Dict]
    next_action: Optional[str]
