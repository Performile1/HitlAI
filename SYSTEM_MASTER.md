# HitlAI System Master Documentation

**Version:** 2.0 (Cloud Architecture)  
**Author:** Rickard Wigrund  
**Last Updated:** January 8, 2026  
**Architecture:** Vercel + Supabase + AI Agents

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Agent System](#agent-system)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Memory System](#memory-system)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Model](#security-model)
12. [Workflow Execution](#workflow-execution)
13. [File Structure](#file-structure)
14. [Configuration](#configuration)
15. [Scaling & Performance](#scaling--performance)

---

## System Overview

### Purpose
HitlAI is a **multi-tenant testing platform** that evaluates web and mobile applications through the lens of cognitive accessibility and user experience. It uses multiple AI agents working in concert to plan, audit, execute, and learn from tests without human intervention (except for HITL checkpoints).

### Key Capabilities
- 🤖 **Autonomous Testing**: AI agents collaborate without human intervention
- 🧠 **Cognitive Focus**: Tests through persona-specific cognitive lenses
- 💾 **Memory Learning**: Vector-based memory system learns from every test
- 🔄 **Self-Healing**: Automatically adapts when tests fail
- 👥 **Multi-Persona**: Tests same flows across different user profiles
- 🌐 **Cross-Platform**: Detects friction patterns across web/mobile
- 📊 **Sentiment Analysis**: Quantifies UX quality with scoring
- 🛑 **HITL Interrupts**: Pauses for human guidance when needed

### Design Philosophy
1. **Cognitive-First**: Every test considers user mental models, attention, and cognitive load
2. **Autonomous by Default**: Minimal human intervention required
3. **Learning System**: Improves with every test through vector memory
4. **Production-Ready**: Built for scale with serverless architecture

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (Next.js Frontend - Vercel)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │  Test Runner │  │   Reports    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Vercel)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /api/test/   │  │ /api/memory/ │  │ /api/hitl/   │          │
│  │   run        │  │   query      │  │   feedback   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION LAYER                            │
│                  (HitlAIOrchestrator)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  State Machine: Coordinates Agent Workflow             │    │
│  │  • Load Persona → Plan Mission → Scout Page            │    │
│  │  • Audit UX → Generate Script → Execute → Learn        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT LAYER                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Mission        │  │ Vision         │  │ Technical        │  │
│  │ Planner        │  │ Specialist     │  │ Executor         │  │
│  │ (GPT-4)        │  │ (Claude 3.5)   │  │ (GPT-4/DeepSeek) │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Playwright  │  │  Crawl4AI    │  │ ScrapeGraph  │          │
│  │  Executor    │  │  Scout       │  │  Mapper      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Supabase)                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (with pgvector extension)         │    │
│  │  • test_runs          • friction_points                │    │
│  │  • memory_lessons     • personas                       │    │
│  │  • action_attempts    • mission_steps                  │    │
│  │  • hitl_feedback                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Storage Buckets                                       │    │
│  │  • screenshots        • reports                        │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Edge Functions                                        │    │
│  │  • crawl-page         • audit-ux                       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OpenAI     │  │  Anthropic   │  │  DeepSeek    │          │
│  │   GPT-4      │  │  Claude 3.5  │  │   (Optional) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. **Frontend (Next.js)**
- **Location**: `/app`
- **Purpose**: User interface for test management, monitoring, and reporting
- **Key Features**:
  - Test creation and configuration
  - Real-time progress tracking via Supabase Realtime
  - Report visualization
  - HITL intervention interface
  - Persona management

### 2. **API Layer (Vercel Serverless)**
- **Location**: `/app/api`
- **Purpose**: RESTful endpoints for test orchestration
- **Routes**:
  - `POST /api/test/run` - Queue new test
  - `POST /api/test/execute` - Execute test workflow
  - `POST /api/memory/query` - Search vector memory
  - `PUT /api/memory/query` - Store new lesson
  - `POST /api/hitl/feedback` - Submit human feedback

### 3. **Orchestrator**
- **Location**: `/lib/orchestrator.ts`
- **Purpose**: Coordinates entire test workflow
- **Responsibilities**:
  - Load persona configuration
  - Coordinate agent execution
  - Manage state transitions
  - Handle HITL interrupts
  - Store results and lessons

### 4. **Agent System**
Six specialized AI agents for comprehensive testing:

#### **Test Strategy Planner** (GPT-4)
- **File**: `/lib/agents/testStrategyPlanner.ts`
- **Role**: Multi-dimensional test planning
- **Input**: Objective, persona, page context, test dimensions
- **Output**: Comprehensive test strategy covering:
  - Happy path tests (normal user flow)
  - Negative tests (invalid inputs, error flows)
  - Boundary tests (edge cases, limits, empty states)
  - Accessibility tests (WCAG, keyboard nav, screen readers)
  - Race condition tests (double-click, concurrent actions)
  - Exploratory tests (chaos, unexpected behavior)
- **Persona Integration**: Prioritizes tests by persona risk factors

#### **Mission Planner** (GPT-4) - Legacy
- **File**: `/lib/agents/missionPlanner.ts`
- **Role**: Simple happy path planning
- **Input**: User objective, persona, page context
- **Output**: Atomic, testable mission steps
- **Note**: Being replaced by Test Strategy Planner for comprehensive coverage

#### **Vision Specialist** (Claude 3.5 Sonnet)
- **File**: `/lib/agents/visionSpecialist.ts`
- **Role**: Persona-weighted UX cognitive auditing
- **Input**: Persona profile, page schema, context, UX heuristics
- **Output**: Friction points with guideline citations, sentiment score
- **Categories**: Visibility, cognitive load, interaction, accessibility
- **Integration**: Uses HeuristicLoader for evidence-based findings

#### **Technical Executor** (GPT-4 / DeepSeek)
- **File**: `/lib/agents/technicalExecutor.ts`
- **Role**: Script generation
- **Input**: Mission step, schema, audit results, memory lessons
- **Output**: Self-healing Playwright script
- **Features**: Retry logic, fallback selectors, error handling

#### **Test Executor**
- **File**: `/lib/agents/testExecutor.ts`
- **Role**: Multi-dimensional test execution
- **Capabilities**:
  - Execute negative tests (invalid inputs)
  - Execute boundary tests (edge cases)
  - Execute accessibility tests (keyboard nav, axe-core)
  - Execute race condition tests (double-click, rapid actions)
  - Execute exploratory tests (chaos, monkey testing)
  - Generate persona-specific observations

#### **Memory Manager**
- **File**: `/lib/memory/memoryManager.ts`
- **Role**: Vector memory operations
- **Capabilities**:
  - Store lessons with embeddings
  - Semantic search for similar issues
  - Cross-platform friction detection

#### **Heuristic Loader**
- **File**: `/lib/memory/heuristicLoader.ts`
- **Role**: Persona-weighted UX guideline retrieval
- **Sources**: Baymard Institute, Nielsen Norman Group, WCAG 2.1
- **Capabilities**:
  - 11 curated UX heuristics
  - Persona relevance scoring (age, eyesight, tech literacy)
  - Context-aware guideline selection
  - Impact reasoning generation

### 5. **Integration Layer**

#### **Playwright Executor**
- **Purpose**: Browser automation
- **Features**:
  - Smart element finding (ARIA, text, CSS)
  - Screenshot capture
  - Retry logic with exponential backoff
  - Error context collection

#### **Crawl Scout** (Supabase Edge Function)
- **Purpose**: Page content extraction
- **Output**: Markdown, HTML, links, metadata
- **Used For**: Initial page understanding

#### **Scrape Mapper**
- **Purpose**: Semantic UI schema extraction
- **Output**: Interactive elements, navigation structure
- **Used For**: Script generation context

### 6. **Database (Supabase PostgreSQL)**
- **Extension**: pgvector for vector similarity search
- **Tables**: 8 core tables (see Database Schema section)
- **Features**: Row-level security, real-time subscriptions

### 7. **Storage (Supabase Storage)**
- **Buckets**:
  - `screenshots`: Test execution screenshots
  - `reports`: Generated PDF/HTML reports

---

## Data Flow

### Test Execution Flow

```
1. USER INITIATES TEST
   ↓
2. API: POST /api/test/run
   • Validate input
   • Create test_run record (status: pending)
   • Return testRunId
   ↓
3. API: POST /api/test/execute (async)
   • Update status: running
   • Initialize HitlAIOrchestrator
   ↓
4. ORCHESTRATOR: Load Persona
   • Query personas table
   • Load cognitive profile
   ↓
5. ORCHESTRATOR: Scout Page
   • Call Supabase Edge Function: crawl-page
   • Extract markdown, HTML, metadata
   • Store in test_run.crawl_context
   ↓
6. ORCHESTRATOR: Map Schema
   • Extract interactive elements
   • Build semantic UI map
   • Store in test_run.semantic_schema
   ↓
7. ORCHESTRATOR: Retrieve Memory
   • Generate query embedding (OpenAI)
   • Search memory_lessons via pgvector
   • Get top 5 similar lessons
   ↓
8. AGENT: Test Strategy Planner
   • Input: objective + persona + context + test dimensions
   • Generate comprehensive test strategy:
     - Happy path tests
     - Negative tests (invalid inputs, error flows)
     - Boundary tests (edge cases, limits, empty states)
     - Accessibility tests (WCAG, keyboard nav)
     - Race condition tests (double-click, rapid actions)
     - Exploratory tests (chaos, unexpected behavior)
   • Output: Multi-dimensional test cases
   • Store in mission_steps table
   ↓
9. ORCHESTRATOR: Load UX Heuristics
   • Query HeuristicLoader with UI context
   • Get top 5 relevant guidelines for persona
   • Weight by persona relevance
   ↓
10. AGENT: Vision Specialist (Auditor)
    • Input: persona + schema + context + heuristics
    • Output: Friction points with guideline citations
    • Store in friction_points table
    • Initialize FrustrationMeter
    ↓
11. FOR EACH MISSION STEP:
    ↓
    11. AGENT: Technical Executor
        • Input: step + schema + audit + memory
        • Output: Playwright script
        ↓
    12. INTEGRATION: Playwright Executor
        • Execute script
        • Capture screenshots
        • Record attempt in action_attempts
        ↓
    13. IF FAILURE (< 3 retries):
        • Retry with adjusted script
        ↓
    14. IF FAILURE (>= 3 retries):
        • Update status: hitl_paused
        • Wait for human feedback
        • Resume with guidance
        ↓
    15. IF SUCCESS:
        • Continue to next step
        ↓
16. ORCHESTRATOR: Learn from Test
    • Extract lessons from failures
    • Generate embeddings
    • Store in memory_lessons
    ↓
17. ORCHESTRATOR: Generate Report
    • Aggregate results
    • Calculate sentiment
    • Format report
    • Store in test_run.final_report
    ↓
18. ORCHESTRATOR: Complete
    • Update status: completed/failed
    • Set completed_at timestamp
    ↓
19. USER VIEWS RESULTS
    • Dashboard shows updated status
    • Report available for download
```

---

## Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + shadcn/ui patterns
- **State Management**: React hooks + Supabase Realtime

### **Backend**
- **Platform**: Vercel Serverless Functions
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Max Duration**: 300 seconds per function

### **Database**
- **Provider**: Supabase (PostgreSQL 15+)
- **Extensions**: pgvector (vector similarity search)
- **Features**: Row-level security, real-time subscriptions
- **Connection**: Supabase JS Client

### **Storage**
- **Provider**: Supabase Storage (S3-compatible)
- **Buckets**: Public (screenshots, reports)
- **CDN**: Automatic via Supabase

### **AI/LLM**
- **OpenAI**: GPT-4 Turbo (planning, execution)
- **Anthropic**: Claude 3.5 Sonnet (UX auditing)
- **DeepSeek**: Optional (cost optimization)
- **Embeddings**: text-embedding-3-small (1536 dimensions)

### **Automation**
- **Browser**: Playwright (Chromium, Firefox, WebKit)
- **Crawling**: Crawl4AI (via Edge Function)
- **Scraping**: ScrapeGraphAI (semantic extraction)

### **Infrastructure**
- **Hosting**: Vercel (frontend + API)
- **Database**: Supabase Cloud
- **Edge Functions**: Supabase Edge Runtime (Deno)
- **CDN**: Vercel Edge Network

---

## Agent System

### Agent Coordination Model

```
┌─────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                          │
│              (State Machine Controller)                 │
│                                                         │
│  Manages:                                               │
│  • Agent sequencing                                     │
│  • State transitions                                    │
│  • Error handling                                       │
│  • HITL checkpoints                                     │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Mission    │  │  Vision     │  │ Technical   │
│  Planner    │  │ Specialist  │  │  Executor   │
│             │  │             │  │             │
│  Strategic  │  │  Analytical │  │ Operational │
│  Thinking   │  │  Auditing   │  │ Execution   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Agent Characteristics

| Agent | LLM | Temperature | Max Tokens | Role |
|-------|-----|-------------|------------|------|
| Mission Planner | GPT-4 | 0.7 | 4096 | Strategic decomposition |
| Vision Specialist | Claude 3.5 | 0.5 | 4096 | Cognitive analysis |
| Technical Executor | GPT-4 | 0.3 | 8192 | Script generation |

### Agent Communication

Agents don't communicate directly. The **Orchestrator** passes context:

```typescript
// Mission Planner receives
{
  mission: string,
  persona: PersonaConfig,
  context: string (markdown)
}

// Vision Specialist receives
{
  persona: PersonaConfig,
  schema: UISchema,
  context: string
}

// Technical Executor receives
{
  missionStep: MissionStep,
  schema: UISchema,
  auditResults: AuditResults,
  memoryLessons: Lesson[]
}
```

---

## Database Schema

### **test_runs**
Primary table tracking each test execution.

```sql
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  persona TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('web', 'mobile')),
  status TEXT CHECK (status IN ('pending', 'running', 'hitl_paused', 'completed', 'failed')),
  current_step_index INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  sentiment_score DECIMAL(3,2),
  crawl_context JSONB,
  semantic_schema JSONB,
  audit_results JSONB,
  final_report TEXT,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### **friction_points**
UX issues identified during auditing.

```sql
CREATE TABLE friction_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs ON DELETE CASCADE,
  element TEXT NOT NULL,
  issue_type TEXT CHECK (issue_type IN ('visibility', 'cognitive_load', 'interaction', 'accessibility')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  persona_impact TEXT,
  resolution TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **memory_lessons**
Vector memory for learning from tests.

```sql
CREATE TABLE memory_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_text TEXT NOT NULL,
  url TEXT,
  platform TEXT,
  friction_type TEXT,
  resolution TEXT,
  embedding VECTOR(1536),  -- pgvector extension
  metadata JSONB,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON memory_lessons USING ivfflat (embedding vector_cosine_ops);
```

### **personas**
User persona configurations.

```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  age INT,
  tech_literacy TEXT,
  eyesight TEXT,
  cognitive_load TEXT,
  attention_rules JSONB,
  preferred_navigation TEXT,
  reading_level TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **mission_steps**
Atomic steps for each test mission.

```sql
CREATE TABLE mission_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs ON DELETE CASCADE,
  step_number INT NOT NULL,
  action TEXT NOT NULL,
  target_element TEXT,
  validation TEXT,
  cognitive_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **action_attempts**
Log of all execution attempts.

```sql
CREATE TABLE action_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs ON DELETE CASCADE,
  step_index INT NOT NULL,
  action_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **hitl_feedback**
Human-in-the-loop intervention records.

```sql
CREATE TABLE hitl_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs ON DELETE CASCADE,
  feedback_type TEXT CHECK (feedback_type IN ('guidance', 'correction', 'approval')),
  feedback_text TEXT NOT NULL,
  provided_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### **POST /api/test/run**
Queue a new test for execution.

**Request:**
```json
{
  "url": "https://example.com",
  "mission": "Sign up for newsletter",
  "persona": "senior_casual",
  "platform": "web"
}
```

**Response:**
```json
{
  "testRunId": "uuid",
  "status": "pending",
  "message": "Test queued for execution"
}
```

### **GET /api/test/run?limit=10&offset=0**
List user's test runs.

**Response:**
```json
{
  "testRuns": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "mission": "Sign up",
      "status": "completed",
      "sentiment_score": 0.75,
      "created_at": "2026-01-08T10:00:00Z"
    }
  ]
}
```

### **POST /api/test/execute**
Execute test workflow (internal, called by /api/test/run).

**Request:**
```json
{
  "testRunId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "testRunId": "uuid",
  "status": "completed"
}
```

### **POST /api/memory/query**
Search vector memory for similar lessons.

**Request:**
```json
{
  "query": "button not clickable on mobile",
  "platform": "mobile",
  "topK": 5
}
```

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "lesson_text": "Mobile buttons need min 44px touch target",
      "similarity": 0.92,
      "resolution": "Increase button size to 48px",
      "platform": "mobile"
    }
  ]
}
```

### **PUT /api/memory/query**
Store a new lesson in vector memory.

**Request:**
```json
{
  "lessonText": "Dropdown menu hidden on small screens",
  "url": "https://example.com",
  "platform": "mobile",
  "frictionType": "visibility",
  "resolution": "Use hamburger menu for mobile",
  "metadata": {}
}
```

**Response:**
```json
{
  "lesson": {
    "id": "uuid",
    "lesson_text": "Dropdown menu hidden on small screens",
    "created_at": "2026-01-08T10:00:00Z"
  }
}
```

---

## Memory System

### Vector Memory Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MEMORY LIFECYCLE                     │
│                                                         │
│  1. Test Execution                                      │
│     ↓                                                   │
│  2. Identify Friction Point                             │
│     ↓                                                   │
│  3. Extract Lesson                                      │
│     "Button too small for senior users"                 │
│     ↓                                                   │
│  4. Generate Embedding (OpenAI)                         │
│     [0.123, -0.456, 0.789, ...] (1536 dims)            │
│     ↓                                                   │
│  5. Store in memory_lessons                             │
│     WITH embedding vector                               │
│     ↓                                                   │
│  6. Future Test Query                                   │
│     "Small clickable elements"                          │
│     ↓                                                   │
│  7. Generate Query Embedding                            │
│     ↓                                                   │
│  8. Vector Similarity Search (pgvector)                 │
│     cosine_distance < 0.3 (similarity > 0.7)           │
│     ↓                                                   │
│  9. Return Top K Lessons                                │
│     With resolution strategies                          │
│     ↓                                                   │
│  10. Apply to New Test                                  │
│      Technical Executor uses lessons                    │
└─────────────────────────────────────────────────────────┘
```

### Memory Query Function

```sql
CREATE FUNCTION match_memory_lessons(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_platform TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  lesson_text TEXT,
  url TEXT,
  platform TEXT,
  friction_type TEXT,
  resolution TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memory_lessons.id,
    memory_lessons.lesson_text,
    memory_lessons.url,
    memory_lessons.platform,
    memory_lessons.friction_type,
    memory_lessons.resolution,
    1 - (memory_lessons.embedding <=> query_embedding) AS similarity
  FROM memory_lessons
  WHERE 
    (filter_platform IS NULL OR memory_lessons.platform = filter_platform)
    AND 1 - (memory_lessons.embedding <=> query_embedding) > match_threshold
  ORDER BY memory_lessons.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Cross-Platform Learning

The memory system detects patterns across platforms:

```typescript
// Check if mobile friction exists on web
const crossPlatformFriction = await memoryManager.checkCrossPlatformFriction(
  'https://example.com',
  'navigation menu',
  'web'  // current platform
);

// Returns lessons from 'mobile' platform if similarity > 0.85
```

---

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                  │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Static Assets (/_next/static/*)              │    │
│  │  • Cached at edge                              │    │
│  │  • Immutable                                   │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  API Routes (/api/*)                          │    │
│  │  • Serverless Functions (Node.js 18)          │    │
│  │  • Max Duration: 300s                         │    │
│  │  • Memory: 3008 MB                            │    │
│  │  • Region: iad1 (US East)                     │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Pages (/)                                     │    │
│  │  • Server-side rendered                        │    │
│  │  • React Server Components                     │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Supabase Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                       │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  PostgreSQL 15 (Primary)                      │    │
│  │  • pgvector extension                          │    │
│  │  • Row-level security                          │    │
│  │  • Automatic backups                           │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Realtime Server                               │    │
│  │  • WebSocket subscriptions                     │    │
│  │  • Table change notifications                  │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Storage (S3-compatible)                       │    │
│  │  • screenshots bucket                          │    │
│  │  • reports bucket                              │    │
│  │  • CDN-backed                                  │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Edge Functions (Deno Runtime)                 │    │
│  │  • crawl-page                                  │    │
│  │  • audit-ux (future)                           │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Auth (GoTrue)                                 │    │
│  │  • Email/password                              │    │
│  │  • OAuth providers                             │    │
│  │  • JWT tokens                                  │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Security Model

### Row-Level Security (RLS)

All tables have RLS policies:

```sql
-- Users can only see their own test runs
CREATE POLICY "Users can view own test runs"
ON test_runs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own test runs
CREATE POLICY "Users can insert own test runs"
ON test_runs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for API routes)
CREATE POLICY "Service role full access"
ON test_runs FOR ALL
USING (auth.role() = 'service_role');
```

### API Security

```typescript
// All API routes verify authentication
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Service role key only in server-side code
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Never exposed to client
)
```

### Environment Variables

```bash
# Public (client-side safe)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Workflow Execution

### Complete Test Workflow

```
START
  │
  ├─► Initialize Test Run
  │   • Create test_runs record
  │   • Status: pending
  │
  ├─► Load Persona
  │   • Query personas table
  │   • Get cognitive profile
  │
  ├─► Scout Page
  │   • Call crawl-page Edge Function
  │   • Extract markdown + HTML
  │   • Store in crawl_context
  │
  ├─► Map UI Schema
  │   • Extract interactive elements
  │   • Build semantic map
  │   • Store in semantic_schema
  │
  ├─► Retrieve Memory
  │   • Generate query embedding
  │   • Search memory_lessons
  │   • Get top 5 similar lessons
  │
  ├─► Plan Mission
  │   • Mission Planner agent
  │   • Break into atomic steps
  │   • Store in mission_steps
  │
  ├─► Audit UX
  │   • Vision Specialist agent
  │   • Identify friction points
  │   • Calculate sentiment score
  │   • Store in friction_points
  │
  ├─► FOR EACH STEP:
  │   │
  │   ├─► Generate Script
  │   │   • Technical Executor agent
  │   │   • Use schema + audit + memory
  │   │   • Create Playwright script
  │   │
  │   ├─► Execute Script
  │   │   • Playwright Executor
  │   │   • Capture screenshots
  │   │   • Record in action_attempts
  │   │
  │   ├─► Check Result
  │   │   │
  │   │   ├─► SUCCESS
  │   │   │   • Continue to next step
  │   │   │
  │   │   └─► FAILURE
  │   │       │
  │   │       ├─► Retries < 3
  │   │       │   • Regenerate script
  │   │       │   • Retry execution
  │   │       │
  │   │       └─► Retries >= 3
  │   │           • Status: hitl_paused
  │   │           • Wait for human feedback
  │   │           • Resume with guidance
  │   │
  │   └─► Next Step
  │
  ├─► Learn from Test
  │   • Extract lessons from failures
  │   • Generate embeddings
  │   • Store in memory_lessons
  │
  ├─► Generate Report
  │   • Aggregate results
  │   • Format markdown
  │   • Store in final_report
  │
  ├─► Complete Test
  │   • Status: completed/failed
  │   • Set completed_at
  │
END
```

---

## File Structure

```
HitlAI/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── test/
│   │   │   ├── run/route.ts      # Queue test
│   │   │   └── execute/route.ts  # Execute test
│   │   └── memory/
│   │       └── query/route.ts    # Memory operations
│   ├── dashboard/                # Dashboard pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── lib/                          # Core library
│   ├── orchestrator.ts           # Main orchestrator
│   ├── agents/
│   │   ├── testStrategyPlanner.ts  # Comprehensive test strategy planner
│   │   ├── testExecutor.ts         # Multi-dimensional test executor
│   │   ├── missionPlanner.ts       # Mission Planner agent (legacy)
│   │   ├── visionSpecialist.ts     # Vision Specialist agent
│   │   └── technicalExecutor.ts    # Technical Executor agent
│   └── memory/
│       ├── memoryManager.ts        # Memory operations
│       └── heuristicLoader.ts      # Persona-weighted UX heuristics
│
├── components/                   # React components
│   └── ui/
│       └── button.tsx            # UI components
│
├── supabase/                     # Supabase configuration
│   ├── migrations/
│   │   └── 20260108_initial_schema.sql
│   ├── functions/
│   │   └── crawl-page/
│   │       └── index.ts          # Edge function
│   └── config.toml               # Supabase config
│
├── config/                       # Configuration files
│   ├── state_schema.py           # State definitions (legacy)
│   └── llm_config.py             # LLM configs (legacy)
│
├── agents/                       # Python agents (legacy)
├── graph/                        # LangGraph state machine (legacy)
├── integrations/                 # Python integrations (legacy)
├── memory/                       # Python memory (legacy)
├── utils/                        # Python utilities (legacy)
├── examples/                     # Example scripts (legacy)
│
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── vercel.json                   # Vercel deployment config
│
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
│
├── README.md                     # Project overview
├── ARCHITECTURE.md               # Architecture details
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
├── VERCEL_SUPABASE_DEPLOYMENT.md # Cloud architecture plan
└── SYSTEM_MASTER.md              # This file
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (private) |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `DEEPSEEK_API_KEY` | No | DeepSeek API key (optional) |
| `XAI_API_KEY` | No | XAI API key (optional) |
| `SCRAPEGRAPH_API_KEY` | No | ScrapeGraph API key (optional) |
| `BROWSERLESS_API_KEY` | No | Browserless API key (optional) |

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

### Supabase Configuration

```toml
[api]
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
port = 54323
```

---

## Scaling & Performance

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Test Execution | < 5 min | For typical 5-step mission |
| API Response | < 500ms | For non-execution endpoints |
| Memory Query | < 200ms | Vector search with pgvector |
| Page Scout | < 10s | Crawl4AI extraction |
| Agent Response | < 30s | LLM generation time |

### Scaling Strategy

#### **Horizontal Scaling**
- Vercel automatically scales serverless functions
- Supabase connection pooling handles concurrent requests
- No manual scaling required

#### **Database Optimization**
```sql
-- Indexes for common queries
CREATE INDEX idx_test_runs_user_status ON test_runs(user_id, status);
CREATE INDEX idx_friction_points_test_run ON friction_points(test_run_id);
CREATE INDEX idx_memory_lessons_platform ON memory_lessons(platform);

-- Vector index for fast similarity search
CREATE INDEX ON memory_lessons USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### **Caching Strategy**
- Persona configurations cached in memory
- UI schemas cached per URL
- Memory lessons cached for 5 minutes

#### **Cost Optimization**
- Use GPT-3.5 for simple tasks
- Batch memory queries
- Compress screenshots before upload
- Archive old test runs (> 90 days)

### Monitoring

```sql
-- Active tests
SELECT COUNT(*) FROM test_runs WHERE status = 'running';

-- Average test duration
SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) / 60 AS avg_minutes
FROM test_runs WHERE status = 'completed';

-- Memory growth
SELECT COUNT(*), pg_size_pretty(SUM(pg_column_size(embedding))) AS size
FROM memory_lessons;

-- Top friction types
SELECT friction_type, COUNT(*) 
FROM friction_points 
GROUP BY friction_type 
ORDER BY COUNT(*) DESC;
```

---

## Appendix

### Glossary

- **HITL**: Human-in-the-Loop - Manual intervention when automation fails
- **Persona**: User profile with cognitive characteristics
- **Friction Point**: UX issue that impedes user flow
- **Sentiment Score**: 0-1 metric quantifying UX quality
- **Vector Embedding**: Numerical representation for semantic search
- **pgvector**: PostgreSQL extension for vector similarity search
- **RLS**: Row-Level Security - Database access control
- **Edge Function**: Serverless function running on edge network

### References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

### Version History

- **v2.0** (2026-01-08): Cloud architecture with Vercel + Supabase
- **v1.0** (2025-12-XX): Local Python architecture with LangGraph

---

**End of System Master Documentation**

*For deployment instructions, see `DEPLOYMENT_GUIDE.md`*  
*For architecture details, see `VERCEL_SUPABASE_DEPLOYMENT.md`*  
*For quick start, see `README.md`*
