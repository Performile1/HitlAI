# HitlAI Architecture

Deep dive into the system architecture and design decisions.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Orchestrator                         │
│  (Entry point, manages test lifecycle, saves reports)       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  LangGraph State Machine                     │
│  (Workflow orchestration, HITL logic, state persistence)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌────────┐   ┌─────────┐   ┌──────────┐
   │ Memory │   │ Agents  │   │Integration│
   │ Store  │   │(CrewAI) │   │  Layer   │
   └────────┘   └─────────┘   └──────────┘
```

## Core Components

### 1. LangGraph State Machine

**File**: `graph/state_machine.py`

The state machine orchestrates the entire testing workflow using a directed graph:

#### Nodes

1. **load_persona** - Loads persona configuration from registry
2. **plan_mission** - Uses Mission Planner to break down objectives
3. **retrieve_memory** - Queries vector store for relevant lessons
4. **scout_page** - Crawls page with Crawl4AI
5. **map_schema** - Extracts semantic UI schema
6. **audit_ux** - Vision Specialist evaluates UX
7. **generate_script** - Technical Executor creates Playwright script
8. **execute_action** - Runs the generated script
9. **check_hitl** - Determines if human intervention needed
10. **await_human** - Pauses for human feedback
11. **learn_lesson** - Stores human guidance in memory
12. **generate_report** - Creates final markdown report

#### State Flow

```
load_persona → plan_mission → retrieve_memory → scout_page
     ↓
map_schema → audit_ux → generate_script → execute_action
     ↓
check_hitl ──┐
     │       │ (failures ≥ 3)
     │       └──→ await_human → learn_lesson ──┐
     │                                          │
     │ (success or max retries)                │
     └──────────────────────────────────────────┴→ generate_report → END
```

#### HITL Logic

The `should_interrupt_for_human` conditional edge determines next action:

- **await_human**: If `hitl_interrupt=True` and no feedback yet
- **retry**: If failures < threshold, regenerate script
- **continue**: If mission complete or max retries exceeded

### 2. CrewAI Agents

**Directory**: `agents/`

Three specialized agents handle different aspects of testing:

#### Mission Planner (GPT-4)

- **Role**: Test strategist
- **Input**: User objective, persona config, page context
- **Output**: Atomic test steps with validation criteria
- **Specialty**: Breaking complex journeys into testable units

#### Vision Specialist (Claude 3.5)

- **Role**: UX cognitive auditor
- **Input**: Persona config, semantic schema, page markdown
- **Output**: Friction points with severity and recommendations
- **Specialty**: Visual analysis and accessibility evaluation

#### Technical Executor (DeepSeek V3)

- **Role**: Playwright automation engineer
- **Input**: Mission step, schema, audit results, memory lessons
- **Output**: Self-healing Playwright script
- **Specialty**: Robust selector strategies and error handling

### 3. Memory System

**File**: `memory/vector_store.py`

Vector-based memory using Pinecone for semantic search:

#### Storage

- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Metadata**: URL, platform, friction type, resolution, timestamp
- **Index**: Cosine similarity for semantic matching

#### Retrieval

```python
# Semantic search
lessons = memory.retrieve_similar_lessons(
    query="button not clickable",
    platform="mobile",
    top_k=5
)

# Cross-platform check
friction = memory.check_cross_platform_friction(
    url="https://example.com",
    element_description="submit button",
    current_platform="web"
)
```

#### Learning Loop

1. Agent fails action 3 times
2. HITL interrupt triggered
3. Human provides guidance
4. Guidance stored as vector with high relevance
5. Future tests retrieve this lesson
6. Agent applies learned solution

### 4. Integration Layer

**Directory**: `integrations/`

#### Crawl4AI Scout

- **Purpose**: Initial page reconnaissance
- **Output**: Fit Markdown (cleaned, semantic content)
- **Features**: Screenshot capture, link extraction, metadata

#### ScrapeGraph Mapper

- **Purpose**: Semantic UI schema extraction
- **Output**: Interactive elements, navigation, accessibility attributes
- **Fallback**: BeautifulSoup parser if API unavailable

#### Playwright Executor

- **Purpose**: Browser automation with retry logic
- **Features**: 
  - Multiple selector strategies (ARIA → data-* → semantic → CSS)
  - Screenshot on every step
  - Exponential backoff retry
  - Smart element finding

## Data Flow

### Test Execution Flow

```
1. User Request
   ↓
2. Initialize State
   - url, mission, persona, platform
   ↓
3. Load Persona Config
   - age, tech_literacy, attention_rules
   ↓
4. Plan Mission
   - Break into atomic steps
   ↓
5. Retrieve Memory
   - Query vector store for similar issues
   - Check cross-platform friction
   ↓
6. Scout Page
   - Crawl with Crawl4AI
   - Extract Fit Markdown
   ↓
7. Map Schema
   - ScrapeGraph semantic extraction
   - Identify interactive elements
   ↓
8. Audit UX
   - Vision Specialist evaluates against persona
   - Generate friction points
   ↓
9. Generate Script
   - Technical Executor creates Playwright code
   - Incorporate memory lessons
   ↓
10. Execute Action
    - Run Playwright script
    - Capture screenshots
    ↓
11. Check Result
    - Success → Next step
    - Failure → Increment counter
    - Failures ≥ 3 → HITL interrupt
    ↓
12. Generate Report
    - Markdown summary
    - JSON state export
```

## State Schema

**File**: `config/state_schema.py`

The `AgentState` TypedDict contains all workflow state:

```python
{
    "url": str,                          # Target URL
    "platform": "web" | "mobile",        # Platform
    "persona": str,                      # Persona name
    "persona_config": PersonaConfig,     # Full persona data
    
    "crawl_context": str,                # Fit Markdown from Crawl4AI
    "semantic_schema": Dict,             # UI schema from ScrapeGraph
    
    "current_mission": str,              # User objective
    "mission_steps": List[str],          # Atomic steps
    "current_step_index": int,           # Progress tracker
    
    "action_attempts": List[ActionAttempt],  # Execution history
    "failure_count": int,                # Consecutive failures
    "hitl_interrupt": bool,              # HITL flag
    "hitl_feedback": str,                # Human guidance
    
    "friction_points": List[FrictionPoint],  # UX issues
    "memory_retrieved": List[MemoryEntry],   # Relevant lessons
    
    "audit_results": Dict,               # Vision Specialist output
    "playwright_script": str,            # Generated script
    "execution_result": Dict,            # Execution outcome
    
    "final_report": str,                 # Markdown report
    "sentiment_score": float,            # 0.0-1.0
    
    "messages": List[Dict],              # Event log
    "next_action": str                   # Next node hint
}
```

## Design Decisions

### Why LangGraph?

- **State Persistence**: Built-in checkpointing for HITL
- **Conditional Routing**: Complex decision logic in graph
- **Resumability**: Can pause and resume workflows
- **Debuggability**: Clear state transitions

### Why CrewAI?

- **Agent Specialization**: Each agent has distinct role
- **Task Management**: Structured task definitions
- **LLM Flexibility**: Easy to swap models per agent
- **Collaboration**: Agents can delegate (future feature)

### Why Multiple LLMs?

- **GPT-4**: Best for strategic planning and reasoning
- **Claude 3.5**: Superior vision and UX analysis
- **DeepSeek V3**: Excellent code generation at lower cost
- **Grok-3**: Real-time verification (future feature)

### Why Vector Memory?

- **Semantic Search**: Find similar issues, not exact matches
- **Cross-Platform**: Learn from mobile, apply to web
- **Scalability**: Handles thousands of lessons
- **Context**: Rich metadata for filtering

## Extension Points

### Adding New Agents

1. Create agent class in `agents/`
2. Define role, goal, backstory
3. Add node to state machine
4. Update state schema if needed

### Custom Personas

Edit `.windsurf/persona_registry.json`:

```json
{
  "custom": {
    "age": 50,
    "tech_literacy": "medium",
    "eyesight": "normal",
    "attention_rules": ["..."],
    "cognitive_load": "medium",
    "preferred_navigation": "linear",
    "reading_level": "intermediate"
  }
}
```

### New Integrations

Implement in `integrations/`:

```python
class CustomIntegration:
    def __init__(self):
        # Setup
        pass
    
    def process(self, input_data):
        # Your logic
        return output_data
```

Add to state machine node.

### Custom Reporting

Override `generate_report_node` in state machine:

```python
def generate_report_node(self, state: AgentState) -> AgentState:
    # Custom report logic
    state['final_report'] = custom_format(state)
    return state
```

## Performance Considerations

### Optimization Strategies

1. **Caching**: Cache Crawl4AI results for same URL
2. **Parallel Agents**: Run non-dependent agents concurrently
3. **Selective Memory**: Limit memory retrieval to top-k
4. **Lazy Loading**: Load personas on-demand
5. **Batch Processing**: Test multiple URLs in parallel

### Scaling

- **Horizontal**: Multiple orchestrator instances
- **Vertical**: Increase LLM rate limits
- **Memory**: Pinecone serverless auto-scales
- **State**: PostgreSQL for distributed state

## Security

### API Key Management

- Keys loaded from environment only
- Never logged or exposed
- Separate keys per environment

### Data Privacy

- Screenshots may contain PII
- Reports stored locally
- Vector embeddings are anonymized
- No data sent to third parties (except LLM APIs)

### Sandboxing

- Playwright runs in isolated context
- No file system access from scripts
- Network requests monitored

## Future Enhancements

1. **Mobile Testing**: Appium integration for native apps
2. **Visual Regression**: Screenshot comparison
3. **Performance Metrics**: Core Web Vitals tracking
4. **A/B Testing**: Compare design variants
5. **Real-time Monitoring**: Continuous testing
6. **Multi-language**: i18n persona support

---

**Architecture designed for**: Extensibility • Reliability • Observability • Maintainability
