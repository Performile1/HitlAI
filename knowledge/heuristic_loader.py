"""
HeuristicLoader - Load and manage UX heuristics from Baymard Institute and Nielsen Norman Group
"""

import json
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
from loguru import logger
import numpy as np
from sentence_transformers import SentenceTransformer


@dataclass
class UXHeuristic:
    """Represents a single UX heuristic/guideline"""
    id: str
    source: str  # 'baymard' or 'nng'
    category: str
    title: str
    description: str
    context: List[str]  # e.g., ['checkout', 'forms', 'mobile']
    severity_weight: float  # 0.0-1.0
    persona_relevance: Dict[str, float]  # persona_name -> relevance score
    examples: List[str]
    citation_url: str


class HeuristicLoader:
    """
    Loads, manages, and retrieves UX heuristics with RAG-based semantic search.
    """
    
    def __init__(self, knowledge_dir: str = "knowledge"):
        self.knowledge_dir = Path(knowledge_dir)
        self.heuristics_file = self.knowledge_dir / "heuristics_db.json"
        self.embeddings_file = self.knowledge_dir / "heuristic_embeddings.npy"
        
        self.heuristics: List[UXHeuristic] = []
        self.embeddings: Optional[np.ndarray] = None
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        self._ensure_knowledge_dir()
        self._load_or_initialize()
    
    def _ensure_knowledge_dir(self):
        """Create knowledge directory if it doesn't exist"""
        self.knowledge_dir.mkdir(exist_ok=True)
    
    def _load_or_initialize(self):
        """Load existing heuristics or initialize with defaults"""
        if self.heuristics_file.exists():
            self._load_heuristics()
            logger.info(f"Loaded {len(self.heuristics)} heuristics from database")
        else:
            self._initialize_default_heuristics()
            self._save_heuristics()
            logger.info("Initialized default heuristics database")
    
    def _initialize_default_heuristics(self):
        """Initialize with curated Baymard + NN/g heuristics"""
        
        # Baymard Institute - E-commerce focused
        baymard_heuristics = [
            UXHeuristic(
                id="BAY-001",
                source="baymard",
                category="Touch Targets",
                title="Minimum Touch Target Size",
                description="Touch targets should be at least 44x44 CSS pixels to ensure easy tapping, especially for users with motor impairments or on mobile devices.",
                context=["mobile", "buttons", "links", "forms"],
                severity_weight=0.9,
                persona_relevance={
                    "senior_casual": 1.0,
                    "accessibility_focused": 1.0,
                    "middle_age_moderate": 0.7,
                    "young_power_user": 0.3
                },
                examples=[
                    "Button too small: 28x28px",
                    "Link spacing insufficient: 8px between targets"
                ],
                citation_url="https://baymard.com/blog/touch-target-size"
            ),
            UXHeuristic(
                id="BAY-002",
                source="baymard",
                category="Form Design",
                title="Inline Form Validation",
                description="Provide immediate, inline validation feedback as users complete form fields. Show success indicators for valid input and clear error messages for invalid input.",
                context=["forms", "checkout", "registration"],
                severity_weight=0.8,
                persona_relevance={
                    "senior_casual": 0.9,
                    "accessibility_focused": 0.8,
                    "middle_age_moderate": 0.8,
                    "young_power_user": 0.6
                },
                examples=[
                    "No validation until form submission",
                    "Error messages not near the problematic field"
                ],
                citation_url="https://baymard.com/blog/inline-form-validation"
            ),
            UXHeuristic(
                id="BAY-003",
                source="baymard",
                category="Checkout Flow",
                title="Guest Checkout Option",
                description="Always provide a guest checkout option. Forcing account creation increases cart abandonment by 23%.",
                context=["checkout", "e-commerce", "registration"],
                severity_weight=0.95,
                persona_relevance={
                    "senior_casual": 0.9,
                    "accessibility_focused": 0.6,
                    "middle_age_moderate": 0.8,
                    "young_power_user": 0.7
                },
                examples=[
                    "Forced account creation before checkout",
                    "No 'Continue as Guest' button visible"
                ],
                citation_url="https://baymard.com/blog/checkout-flow"
            ),
            UXHeuristic(
                id="BAY-004",
                source="baymard",
                category="Visual Hierarchy",
                title="Clear Visual Hierarchy",
                description="Use size, color, and spacing to create a clear visual hierarchy. Primary actions should be visually prominent.",
                context=["buttons", "navigation", "layout"],
                severity_weight=0.7,
                persona_relevance={
                    "senior_casual": 0.95,
                    "accessibility_focused": 0.9,
                    "middle_age_moderate": 0.8,
                    "young_power_user": 0.5
                },
                examples=[
                    "Primary and secondary buttons look identical",
                    "Important information buried in dense text"
                ],
                citation_url="https://baymard.com/blog/visual-hierarchy"
            ),
            UXHeuristic(
                id="BAY-005",
                source="baymard",
                category="Mobile Navigation",
                title="Thumb-Friendly Navigation",
                description="Place primary navigation and actions in the thumb zone (bottom 1/3 of screen) for one-handed mobile use.",
                context=["mobile", "navigation", "buttons"],
                severity_weight=0.8,
                persona_relevance={
                    "senior_casual": 0.8,
                    "accessibility_focused": 0.7,
                    "middle_age_moderate": 0.7,
                    "young_power_user": 0.9
                },
                examples=[
                    "Primary action at top of screen",
                    "Navigation requires two-handed use"
                ],
                citation_url="https://baymard.com/blog/mobile-navigation"
            )
        ]
        
        # Nielsen Norman Group - General UX
        nng_heuristics = [
            UXHeuristic(
                id="NNG-001",
                source="nng",
                category="Visibility of System Status",
                title="Keep Users Informed",
                description="The system should always keep users informed about what is going on through appropriate feedback within reasonable time.",
                context=["loading", "feedback", "progress"],
                severity_weight=0.85,
                persona_relevance={
                    "senior_casual": 0.9,
                    "accessibility_focused": 1.0,
                    "middle_age_moderate": 0.8,
                    "young_power_user": 0.6
                },
                examples=[
                    "No loading indicator during long operations",
                    "Form submission with no confirmation"
                ],
                citation_url="https://www.nngroup.com/articles/ten-usability-heuristics/"
            ),
            UXHeuristic(
                id="NNG-002",
                source="nng",
                category="Error Prevention",
                title="Prevent Errors Before They Occur",
                description="Good error messages are important, but better designs prevent problems from occurring in the first place.",
                context=["forms", "validation", "constraints"],
                severity_weight=0.9,
                persona_relevance={
                    "senior_casual": 1.0,
                    "accessibility_focused": 0.9,
                    "middle_age_moderate": 0.9,
                    "young_power_user": 0.7
                },
                examples=[
                    "No input constraints on date fields",
                    "Destructive actions without confirmation"
                ],
                citation_url="https://www.nngroup.com/articles/slips/"
            ),
            UXHeuristic(
                id="NNG-003",
                source="nng",
                category="Recognition vs Recall",
                title="Minimize Memory Load",
                description="Minimize the user's memory load by making objects, actions, and options visible. Instructions should be visible or easily retrievable.",
                context=["navigation", "forms", "instructions"],
                severity_weight=0.8,
                persona_relevance={
                    "senior_casual": 1.0,
                    "accessibility_focused": 0.9,
                    "middle_age_moderate": 0.9,
                    "young_power_user": 0.5
                },
                examples=[
                    "Hidden navigation requiring memorization",
                    "Multi-step process without progress indicator"
                ],
                citation_url="https://www.nngroup.com/articles/recognition-and-recall/"
            ),
            UXHeuristic(
                id="NNG-004",
                source="nng",
                category="Consistency",
                title="Follow Platform Conventions",
                description="Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.",
                context=["navigation", "terminology", "patterns"],
                severity_weight=0.75,
                persona_relevance={
                    "senior_casual": 0.9,
                    "accessibility_focused": 0.8,
                    "middle_age_moderate": 0.8,
                    "young_power_user": 0.6
                },
                examples=[
                    "Inconsistent button placement across pages",
                    "Non-standard icons without labels"
                ],
                citation_url="https://www.nngroup.com/articles/consistency-and-standards/"
            ),
            UXHeuristic(
                id="NNG-005",
                source="nng",
                category="Accessibility",
                title="Sufficient Color Contrast",
                description="Text and interactive elements must have sufficient color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text).",
                context=["accessibility", "visual", "text"],
                severity_weight=0.95,
                persona_relevance={
                    "senior_casual": 1.0,
                    "accessibility_focused": 1.0,
                    "middle_age_moderate": 0.9,
                    "young_power_user": 0.4
                },
                examples=[
                    "Light gray text on white background (2:1 contrast)",
                    "Low contrast buttons"
                ],
                citation_url="https://www.nngroup.com/articles/low-contrast/"
            ),
            UXHeuristic(
                id="NNG-006",
                source="nng",
                category="Flexibility",
                title="Accelerators for Expert Users",
                description="Provide accelerators (shortcuts, gestures) for experienced users while keeping the interface accessible to novices.",
                context=["keyboard", "shortcuts", "efficiency"],
                severity_weight=0.6,
                persona_relevance={
                    "senior_casual": 0.3,
                    "accessibility_focused": 0.8,
                    "middle_age_moderate": 0.5,
                    "young_power_user": 1.0
                },
                examples=[
                    "No keyboard shortcuts available",
                    "Cannot skip repetitive steps"
                ],
                citation_url="https://www.nngroup.com/articles/flexibility-efficiency-heuristic/"
            )
        ]
        
        self.heuristics = baymard_heuristics + nng_heuristics
        self._generate_embeddings()
    
    def _generate_embeddings(self):
        """Generate embeddings for all heuristics"""
        texts = [
            f"{h.title}. {h.description}. Context: {', '.join(h.context)}"
            for h in self.heuristics
        ]
        self.embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
        
        # Save embeddings
        np.save(self.embeddings_file, self.embeddings)
        logger.info(f"Generated embeddings for {len(self.heuristics)} heuristics")
    
    def get_relevant_guidelines(
        self,
        ui_context: str,
        persona_name: str = None,
        top_k: int = 5,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Retrieve the most relevant UX guidelines for the current UI context.
        
        Args:
            ui_context: Description of current screen/page (e.g., "checkout payment form")
            persona_name: Name of persona to weight relevance
            top_k: Number of guidelines to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of relevant guidelines with scores
        """
        # Generate embedding for query
        query_embedding = self.embedding_model.encode([ui_context], convert_to_numpy=True)[0]
        
        # Calculate cosine similarity
        similarities = np.dot(self.embeddings, query_embedding) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k * 2]  # Get more for filtering
        
        results = []
        for idx in top_indices:
            if similarities[idx] < min_similarity:
                continue
                
            heuristic = self.heuristics[idx]
            score = float(similarities[idx])
            
            # Apply persona weighting if specified
            if persona_name and persona_name in heuristic.persona_relevance:
                persona_weight = heuristic.persona_relevance[persona_name]
                weighted_score = score * (0.7 + 0.3 * persona_weight)  # 70% similarity, 30% persona
            else:
                weighted_score = score
            
            results.append({
                'heuristic': asdict(heuristic),
                'similarity_score': score,
                'weighted_score': weighted_score,
                'persona_relevance': heuristic.persona_relevance.get(persona_name, 0.5) if persona_name else None
            })
        
        # Sort by weighted score and return top-k
        results.sort(key=lambda x: x['weighted_score'], reverse=True)
        return results[:top_k]
    
    def get_by_category(self, category: str) -> List[UXHeuristic]:
        """Get all heuristics in a specific category"""
        return [h for h in self.heuristics if h.category.lower() == category.lower()]
    
    def get_by_context(self, context: str) -> List[UXHeuristic]:
        """Get all heuristics relevant to a specific context"""
        return [h for h in self.heuristics if context.lower() in [c.lower() for c in h.context]]
    
    def get_high_priority_for_persona(self, persona_name: str, min_relevance: float = 0.7) -> List[UXHeuristic]:
        """Get high-priority heuristics for a specific persona"""
        return [
            h for h in self.heuristics
            if h.persona_relevance.get(persona_name, 0) >= min_relevance
        ]
    
    def _save_heuristics(self):
        """Save heuristics to JSON file"""
        data = [asdict(h) for h in self.heuristics]
        with open(self.heuristics_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(self.heuristics)} heuristics to {self.heuristics_file}")
    
    def _load_heuristics(self):
        """Load heuristics from JSON file"""
        with open(self.heuristics_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.heuristics = [UXHeuristic(**item) for item in data]
        
        # Load embeddings if available
        if self.embeddings_file.exists():
            self.embeddings = np.load(self.embeddings_file)
        else:
            self._generate_embeddings()
    
    def add_custom_heuristic(self, heuristic: UXHeuristic):
        """Add a custom heuristic to the database"""
        self.heuristics.append(heuristic)
        self._generate_embeddings()
        self._save_heuristics()
        logger.info(f"Added custom heuristic: {heuristic.id}")


# Example usage
if __name__ == "__main__":
    loader = HeuristicLoader()
    
    # Test retrieval
    guidelines = loader.get_relevant_guidelines(
        ui_context="mobile checkout page with payment form",
        persona_name="senior_casual",
        top_k=5
    )
    
    print("\n=== Relevant Guidelines ===")
    for i, result in enumerate(guidelines, 1):
        h = result['heuristic']
        print(f"\n{i}. [{h['id']}] {h['title']}")
        print(f"   Source: {h['source']} | Category: {h['category']}")
        print(f"   Similarity: {result['similarity_score']:.2f} | Weighted: {result['weighted_score']:.2f}")
        print(f"   {h['description'][:100]}...")
