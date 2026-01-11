# Human Behavior Learning System

## Overview

HitlAI now learns from **real user sessions** to refine personas and discover friction points organically.

## Architecture

### **1. Session Recording** 📹
- Client-side script captures user interactions
- Privacy-first: anonymized, consent-required
- Tracks: clicks, scrolls, errors, hesitations, rage clicks

### **2. Behavior Analysis** 🔍
- `BehaviorAnalyzer` extracts patterns from sessions
- Groups by age/tech literacy/device
- Identifies: friction points, navigation flows, error recovery

### **3. Persona Refinement** 🎯
- AI suggests persona updates based on real behavior
- Human approval required before applying
- Tracks confidence scores and evidence

## Database Tables

**Created in**: `20260109_human_behavior_learning.sql`

1. `user_sessions` - Session metadata
2. `user_interactions` - Granular events
3. `behavior_patterns` - Extracted insights
4. `persona_refinements` - Suggested persona updates
5. `friction_heatmap` - Aggregated friction by element

## Usage

```typescript
// 1. Analyze sessions
const analyzer = new BehaviorAnalyzer()
const patterns = await analyzer.analyzeSessions('https://example.com', 10)

// 2. Suggest persona refinements
await analyzer.suggestPersonaRefinements(personaId, patterns)

// 3. Review and approve refinements
// (via UI dashboard)
```

## Benefits

✅ **Real-world validation** - Personas evolve from actual usage  
✅ **Organic friction discovery** - Find issues humans encounter naturally  
✅ **Continuous improvement** - System gets smarter over time  
✅ **Privacy-first** - All data anonymized, consent-required
