# HitlAI Cloud Deployment Plan
## Vercel + Supabase Architecture

This document outlines the complete restructuring of HitlAI for cloud deployment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend + API)                   │
├─────────────────────────────────────────────────────────────┤
│  Next.js App                                                 │
│  ├── /app (Frontend)                                         │
│  │   ├── Dashboard (test management)                         │
│  │   ├── Reports (friction analysis)                         │
│  │   └── Personas (configuration)                            │
│  │                                                            │
│  └── /api (Serverless Functions)                             │
│      ├── /test/run - Execute cognitive tests                 │
│      ├── /test/status - Check test progress                  │
│      ├── /hitl/feedback - Human intervention                 │
│      ├── /memory/query - Vector search                       │
│      └── /reports/generate - Create reports                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector                                       │
│  ├── test_runs (execution state)                             │
│  ├── friction_points (UX issues)                             │
│  ├── memory_lessons (vector embeddings)                      │
│  ├── personas (configurations)                               │
│  └── screenshots (storage bucket)                            │
│                                                               │
│  Edge Functions                                              │
│  ├── crawl-page (Crawl4AI wrapper)                           │
│  ├── audit-ux (Vision Specialist)                            │
│  └── execute-playwright (Browser automation)                 │
│                                                               │
│  Realtime                                                    │
│  └── Test progress updates via WebSocket                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Changes from Local Architecture

### 1. State Management
- **Before**: LangGraph with in-memory state
- **After**: Supabase PostgreSQL with realtime subscriptions
- **Benefit**: Persistent state, multi-user support, progress tracking

### 2. Vector Memory
- **Before**: Pinecone
- **After**: Supabase Vector (pgvector extension)
- **Benefit**: Single database, lower cost, same performance

### 3. Agent Execution
- **Before**: Synchronous Python orchestrator
- **After**: Async Vercel serverless functions with queue system
- **Benefit**: Scalable, handles concurrent tests, timeout-safe

### 4. Browser Automation
- **Before**: Local Playwright
- **After**: Supabase Edge Functions + Browserless.io or Playwright on Vercel
- **Benefit**: Serverless browsers, no local dependencies

### 5. File Storage
- **Before**: Local filesystem (screenshots, reports)
- **After**: Supabase Storage buckets
- **Benefit**: CDN delivery, secure access, unlimited storage

---

## Database Schema (Supabase)

### Tables

#### `test_runs`
```sql
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  persona TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'running', 'hitl_paused', 'completed', 'failed'
  current_step_index INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  sentiment_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);
```

#### `friction_points`
```sql
CREATE TABLE friction_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  element TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  persona_impact TEXT,
  resolution TEXT,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `memory_lessons` (with pgvector)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memory_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_text TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  friction_type TEXT NOT NULL,
  resolution TEXT,
  embedding vector(1536), -- OpenAI embeddings
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON memory_lessons USING ivfflat (embedding vector_cosine_ops);
```

#### `personas`
```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  age INT,
  tech_literacy TEXT,
  eyesight TEXT,
  attention_rules JSONB,
  cognitive_load TEXT,
  preferred_navigation TEXT,
  reading_level TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id)
);
```

#### `action_attempts`
```sql
CREATE TABLE action_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  selector TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage Buckets

```sql
-- Screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true);

-- Reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true);
```

---

## Vercel API Routes

### `/api/test/run` - Start Test
```typescript
// POST /api/test/run
{
  "url": "https://example.com",
  "mission": "Navigate to contact page",
  "persona": "senior_casual",
  "platform": "web"
}

// Response
{
  "testRunId": "uuid",
  "status": "pending"
}
```

### `/api/test/status` - Check Progress
```typescript
// GET /api/test/status?testRunId=uuid

// Response
{
  "status": "running",
  "currentStep": 3,
  "totalSteps": 10,
  "frictionPoints": 2,
  "sentimentScore": 0.75
}
```

### `/api/hitl/feedback` - Human Intervention
```typescript
// POST /api/hitl/feedback
{
  "testRunId": "uuid",
  "feedback": "Use the blue button in footer"
}

// Response
{
  "status": "resumed",
  "lessonStored": true
}
```

### `/api/memory/query` - Search Lessons
```typescript
// POST /api/memory/query
{
  "query": "button not clickable",
  "platform": "mobile",
  "topK": 5
}

// Response
{
  "lessons": [
    {
      "similarity": 0.92,
      "lessonText": "...",
      "resolution": "..."
    }
  ]
}
```

---

## Deployment Steps

### Phase 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note: Project URL, anon key, service role key

2. **Run Migrations**
   ```bash
   supabase init
   supabase db push
   ```

3. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

4. **Configure Storage**
   - Create buckets: `screenshots`, `reports`
   - Set public access policies

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy crawl-page
   supabase functions deploy audit-ux
   supabase functions deploy execute-playwright
   ```

### Phase 2: Vercel Setup

1. **Initialize Next.js**
   ```bash
   npx create-next-app@latest hitlai-cloud --typescript --tailwind --app
   ```

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   npm install openai anthropic
   npm install @langchain/openai @langchain/anthropic
   npm install crewai-js
   npm install playwright-core
   ```

3. **Configure Environment Variables**
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key

   # LLM APIs
   OPENAI_API_KEY=sk-proj-...
   ANTHROPIC_API_KEY=sk-ant-...
   DEEPSEEK_API_KEY=...

   # Optional
   BROWSERLESS_API_KEY=...
   SCRAPEGRAPH_API_KEY=...
   ```

4. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Phase 3: Migration

1. **Port Python Agents to TypeScript**
   - Mission Planner → `/lib/agents/missionPlanner.ts`
   - Vision Specialist → `/lib/agents/visionSpecialist.ts`
   - Technical Executor → `/lib/agents/technicalExecutor.ts`

2. **Implement State Machine**
   - Replace LangGraph with custom state manager
   - Use Supabase Realtime for progress updates

3. **Migrate Memory System**
   - Port Pinecone logic to pgvector
   - Use Supabase RPC for vector search

---

## Frontend Features

### Dashboard (`/app/dashboard`)
- Create new tests
- View running tests with live progress
- Manage personas
- Query memory lessons

### Reports (`/app/reports/[id]`)
- Interactive friction point visualization
- Sentiment score charts
- Screenshot gallery
- Downloadable markdown reports

### Personas (`/app/personas`)
- CRUD for custom personas
- Preset library (senior_casual, etc.)
- Persona comparison tool

### HITL Interface (`/app/hitl/[testId]`)
- Real-time test monitoring
- Intervention prompt when needed
- Screenshot review
- Feedback submission

---

## Cost Estimation

### Supabase (Free Tier)
- Database: 500MB (sufficient for thousands of tests)
- Storage: 1GB (screenshots/reports)
- Edge Functions: 500K invocations/month
- **Cost**: $0/month initially, ~$25/month at scale

### Vercel (Hobby Tier)
- Serverless Functions: 100GB-hours/month
- Bandwidth: 100GB/month
- **Cost**: $0/month initially, ~$20/month at scale

### LLM APIs (Pay-per-use)
- OpenAI: ~$0.50 per test (GPT-4)
- Anthropic: ~$0.30 per test (Claude 3.5)
- **Cost**: Variable, ~$0.80 per complete test

### Total
- **Development**: Free
- **Production (100 tests/month)**: ~$125/month
- **Production (1000 tests/month)**: ~$850/month

---

## Advantages of Cloud Architecture

✅ **Scalability**: Handle multiple concurrent tests
✅ **Persistence**: All data stored permanently
✅ **Collaboration**: Multi-user support via Supabase Auth
✅ **Monitoring**: Real-time progress tracking
✅ **Cost-Effective**: Pay only for what you use
✅ **No Infrastructure**: Fully serverless
✅ **Global**: CDN delivery for reports/screenshots
✅ **Secure**: Row-level security in Supabase

---

## Next Steps

1. Review this plan
2. Confirm Vercel + Supabase approach
3. I'll generate:
   - Supabase migrations
   - Next.js app structure
   - API routes
   - Frontend components
   - Deployment configs

Ready to proceed?
