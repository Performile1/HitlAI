"""
Frustration Meter - Tracks user frustration and triggers HITL interrupts
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger


@dataclass
class FrustrationEvent:
    """Single event contributing to frustration score"""
    timestamp: str
    event_type: str  # 'friction', 'retry', 'timeout', 'error'
    severity: float  # 0.0-1.0
    description: str
    context: Dict[str, Any] = field(default_factory=dict)


class FrustrationMeter:
    """
    Tracks cumulative frustration during test execution and determines
    when to trigger Human-in-the-Loop (HITL) intervention.
    """
    
    def __init__(
        self,
        hitl_threshold: float = 0.75,
        max_retries: int = 3,
        timeout_weight: float = 0.3,
        friction_weight: float = 0.4,
        error_weight: float = 0.3
    ):
        """
        Initialize the frustration meter.
        
        Args:
            hitl_threshold: Score threshold (0-1) that triggers HITL
            max_retries: Maximum retries before forced HITL
            timeout_weight: Weight for timeout events
            friction_weight: Weight for friction point events
            error_weight: Weight for error events
        """
        self.hitl_threshold = hitl_threshold
        self.max_retries = max_retries
        self.timeout_weight = timeout_weight
        self.friction_weight = friction_weight
        self.error_weight = error_weight
        
        self.events: List[FrustrationEvent] = []
        self.retry_count = 0
        self.current_score = 0.0
        self.hitl_triggered = False
        
        logger.info(f"FrustrationMeter initialized (threshold: {hitl_threshold})")
    
    def record_friction(
        self,
        element: str,
        issue_type: str,
        severity: str,
        persona_impact: str
    ) -> float:
        """
        Record a friction point from UX audit.
        
        Args:
            element: Element with friction
            issue_type: Type of issue (visibility, cognitive_load, etc.)
            severity: low/medium/high/critical
            persona_impact: Why this matters for the persona
            
        Returns:
            Updated frustration score
        """
        severity_map = {
            'low': 0.2,
            'medium': 0.4,
            'high': 0.7,
            'critical': 1.0
        }
        
        severity_score = severity_map.get(severity.lower(), 0.5)
        
        event = FrustrationEvent(
            timestamp=datetime.now().isoformat(),
            event_type='friction',
            severity=severity_score,
            description=f"{issue_type} on {element}",
            context={
                'element': element,
                'issue_type': issue_type,
                'severity': severity,
                'persona_impact': persona_impact
            }
        )
        
        self.events.append(event)
        self._recalculate_score()
        
        logger.debug(f"Friction recorded: {element} ({severity}) - Score: {self.current_score:.2f}")
        return self.current_score
    
    def record_retry(
        self,
        action: str,
        reason: str,
        attempt_number: int
    ) -> float:
        """
        Record a retry attempt.
        
        Args:
            action: Action that was retried
            reason: Why retry was needed
            attempt_number: Which attempt this is
            
        Returns:
            Updated frustration score
        """
        self.retry_count += 1
        
        # Retries get progressively more severe
        severity = min(0.3 + (attempt_number * 0.2), 1.0)
        
        event = FrustrationEvent(
            timestamp=datetime.now().isoformat(),
            event_type='retry',
            severity=severity,
            description=f"Retry #{attempt_number}: {action}",
            context={
                'action': action,
                'reason': reason,
                'attempt_number': attempt_number
            }
        )
        
        self.events.append(event)
        self._recalculate_score()
        
        # Check if max retries exceeded
        if self.retry_count >= self.max_retries:
            self.hitl_triggered = True
            logger.warning(f"Max retries ({self.max_retries}) exceeded - HITL triggered")
        
        logger.debug(f"Retry recorded: {action} (attempt {attempt_number}) - Score: {self.current_score:.2f}")
        return self.current_score
    
    def record_timeout(
        self,
        action: str,
        timeout_duration: float,
        expected_duration: float
    ) -> float:
        """
        Record a timeout event.
        
        Args:
            action: Action that timed out
            timeout_duration: How long it took
            expected_duration: How long it should have taken
            
        Returns:
            Updated frustration score
        """
        # Severity based on how much longer it took
        ratio = timeout_duration / expected_duration if expected_duration > 0 else 2.0
        severity = min(0.5 + (ratio - 1.0) * 0.3, 1.0)
        
        event = FrustrationEvent(
            timestamp=datetime.now().isoformat(),
            event_type='timeout',
            severity=severity,
            description=f"Timeout on {action}",
            context={
                'action': action,
                'timeout_duration': timeout_duration,
                'expected_duration': expected_duration,
                'ratio': ratio
            }
        )
        
        self.events.append(event)
        self._recalculate_score()
        
        logger.debug(f"Timeout recorded: {action} ({timeout_duration:.1f}s) - Score: {self.current_score:.2f}")
        return self.current_score
    
    def record_error(
        self,
        action: str,
        error_type: str,
        error_message: str,
        is_recoverable: bool = True
    ) -> float:
        """
        Record an error event.
        
        Args:
            action: Action that caused error
            error_type: Type of error
            error_message: Error details
            is_recoverable: Whether error can be recovered from
            
        Returns:
            Updated frustration score
        """
        severity = 0.6 if is_recoverable else 1.0
        
        event = FrustrationEvent(
            timestamp=datetime.now().isoformat(),
            event_type='error',
            severity=severity,
            description=f"Error on {action}: {error_type}",
            context={
                'action': action,
                'error_type': error_type,
                'error_message': error_message,
                'is_recoverable': is_recoverable
            }
        )
        
        self.events.append(event)
        self._recalculate_score()
        
        logger.debug(f"Error recorded: {action} ({error_type}) - Score: {self.current_score:.2f}")
        return self.current_score
    
    def _recalculate_score(self):
        """
        Recalculate frustration score based on all events.
        Uses weighted average with time decay (recent events matter more).
        """
        if not self.events:
            self.current_score = 0.0
            return
        
        # Separate events by type
        friction_events = [e for e in self.events if e.event_type == 'friction']
        retry_events = [e for e in self.events if e.event_type == 'retry']
        timeout_events = [e for e in self.events if e.event_type == 'timeout']
        error_events = [e for e in self.events if e.event_type == 'error']
        
        # Calculate component scores
        friction_score = self._calculate_component_score(friction_events)
        retry_score = self._calculate_component_score(retry_events)
        timeout_score = self._calculate_component_score(timeout_events)
        error_score = self._calculate_component_score(error_events)
        
        # Weighted combination
        self.current_score = (
            friction_score * self.friction_weight +
            (retry_score + timeout_score) * self.timeout_weight +
            error_score * self.error_weight
        )
        
        # Check if threshold exceeded
        if self.current_score >= self.hitl_threshold and not self.hitl_triggered:
            self.hitl_triggered = True
            logger.warning(f"Frustration threshold ({self.hitl_threshold}) exceeded - HITL triggered")
    
    def _calculate_component_score(self, events: List[FrustrationEvent]) -> float:
        """Calculate score for a specific event type with time decay"""
        if not events:
            return 0.0
        
        # Recent events have more weight (exponential decay)
        total_weight = 0.0
        weighted_sum = 0.0
        
        for i, event in enumerate(reversed(events)):
            # More recent = higher weight (decay factor 0.8)
            weight = 0.8 ** i
            weighted_sum += event.severity * weight
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def should_trigger_hitl(self) -> bool:
        """Check if HITL intervention should be triggered"""
        return self.hitl_triggered or self.current_score >= self.hitl_threshold
    
    def get_hitl_context(self) -> Dict[str, Any]:
        """
        Get context information for HITL intervention.
        
        Returns:
            Dictionary with frustration details for human review
        """
        recent_events = self.events[-5:] if len(self.events) > 5 else self.events
        
        return {
            'frustration_score': self.current_score,
            'threshold': self.hitl_threshold,
            'retry_count': self.retry_count,
            'total_events': len(self.events),
            'recent_events': [
                {
                    'type': e.event_type,
                    'severity': e.severity,
                    'description': e.description,
                    'timestamp': e.timestamp
                }
                for e in recent_events
            ],
            'event_breakdown': {
                'friction': len([e for e in self.events if e.event_type == 'friction']),
                'retries': len([e for e in self.events if e.event_type == 'retry']),
                'timeouts': len([e for e in self.events if e.event_type == 'timeout']),
                'errors': len([e for e in self.events if e.event_type == 'error'])
            },
            'recommendation': self._get_recommendation()
        }
    
    def _get_recommendation(self) -> str:
        """Generate recommendation for human intervention"""
        if self.retry_count >= self.max_retries:
            return "Multiple retries failed. Manual intervention needed to identify root cause."
        
        if self.current_score >= 0.9:
            return "Critical frustration level. Consider redesigning this flow or providing alternative path."
        
        if self.current_score >= self.hitl_threshold:
            return "Significant friction detected. Human review recommended to assess severity."
        
        return "Frustration within acceptable range. Continue automated testing."
    
    def reset(self):
        """Reset the frustration meter for a new test"""
        self.events.clear()
        self.retry_count = 0
        self.current_score = 0.0
        self.hitl_triggered = False
        logger.info("FrustrationMeter reset")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary statistics"""
        return {
            'current_score': self.current_score,
            'hitl_triggered': self.hitl_triggered,
            'total_events': len(self.events),
            'retry_count': self.retry_count,
            'event_types': {
                'friction': len([e for e in self.events if e.event_type == 'friction']),
                'retry': len([e for e in self.events if e.event_type == 'retry']),
                'timeout': len([e for e in self.events if e.event_type == 'timeout']),
                'error': len([e for e in self.events if e.event_type == 'error'])
            }
        }


# Example usage
if __name__ == "__main__":
    meter = FrustrationMeter(hitl_threshold=0.75)
    
    # Simulate test execution
    meter.record_friction("Submit button", "interaction", "high", "Too small for senior users")
    print(f"Score after friction: {meter.current_score:.2f}")
    
    meter.record_retry("Click submit", "Element not found", 1)
    print(f"Score after retry 1: {meter.current_score:.2f}")
    
    meter.record_retry("Click submit", "Element not clickable", 2)
    print(f"Score after retry 2: {meter.current_score:.2f}")
    
    meter.record_error("Click submit", "TimeoutError", "Element did not become clickable", is_recoverable=True)
    print(f"Score after error: {meter.current_score:.2f}")
    
    if meter.should_trigger_hitl():
        context = meter.get_hitl_context()
        print("\n=== HITL TRIGGERED ===")
        print(f"Frustration Score: {context['frustration_score']:.2f}")
        print(f"Recommendation: {context['recommendation']}")
