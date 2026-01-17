# HitlAI - Master Technical Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [AI System](#ai-system)
6. [Progressive Unlock System](#progressive-unlock-system)
7. [User Flows](#user-flows)
8. [API Reference](#api-reference)
9. [Testing Capabilities](#testing-capabilities)
10. [Deployment](#deployment)
11. [Security](#security)
12. [Performance](#performance)

---

## System Overview

### What is HitlAI?

HitlAI is a hybrid AI-powered testing platform that combines artificial intelligence with human testers to provide comprehensive website and application testing. The platform uses a progressive unlock system where the AI improves over time, reducing costs while maintaining quality.

### Core Value Proposition

- **Hybrid Testing:** AI tests (fast, cheap) + Human tests (thorough, nuanced)
- **Progressive AI Evolution:** AI gets better and cheaper as more tests are completed
- **Training Data Collection:** Every test improves the AI
- **Early Adopter Programs:** Lock in lifetime discounts and equity opportunities

### Key Metrics

- **Phase 1 (Current):** $5/AI test, $25/human test
- **Phase 2 (1,000 tests):** $3/AI test (40% reduction)
- **Phase 3 (5,000 tests):** $1.50/AI test (70% reduction)
- **Phase 4 (10,000 tests):** $1/AI test (80% reduction)

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Marketing│  │ Company  │  │  Tester  │  │  Admin   │   │
│  │  Pages   │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Test API │  │Milestone │  │ Training │  │  Early   │   │
│  │          │  │   API    │  │   API    │  │ Adopter  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Hybrid  │  │  Tiered  │  │ Training │  │Milestone │   │
│  │Orchestr. │  │Reasoning │  │Collector │  │ Tracker  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  OpenAI  │  │Anthropic │  │  Groq    │  │Browserless│  │
│  │  GPT-4   │  │  Claude  │  │  LLaMA   │  │ (Browser)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (Supabase/PostgreSQL)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Test Runs │  │ Training │  │Milestones│  │  Users   │   │
│  │  Issues  │  │   Data   │  │  Early   │  │Companies │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend Layer
- **Marketing Pages:** Homepage, pricing, about, early adopter applications
- **Company Dashboard:** Test management, results viewing, team management
- **Tester Dashboard:** Test assignments, earnings tracking, performance metrics
- **Admin Dashboard:** Platform management, training data review, fine-tuning control

#### API Layer
- **Test Execution API:** Orchestrates AI and human tests
- **Milestone API:** Tracks progress toward phase unlocks
- **Training API:** Manages data collection and fine-tuning
- **Application API:** Handles early adopter and founding tester applications

#### Business Logic Layer
- **Hybrid Orchestrator:** Routes tests to AI or human testers
- **Tiered Reasoning:** Selects optimal AI model based on task complexity and phase
- **Training Data Collector:** Captures test data for AI improvement
- **Milestone Tracker:** Updates progress and unlocks phases

#### Data Layer
- **PostgreSQL (Supabase):** Primary database
- **Row Level Security (RLS):** Data isolation and security
- **Real-time Subscriptions:** Live updates for dashboards
- **Vector Embeddings:** Semantic search for test results

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** React Hooks + Server Components
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (Vercel Edge Functions)
- **API:** Next.js API Routes
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)

### AI/ML
- **Primary Models:** OpenAI GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet
- **Fine-tuning:** OpenAI Fine-tuning API
- **Future:** LLaMA 3.1 8B, Mixtral 8x7B (self-hosted or Groq)
- **Browser Automation:** Puppeteer + Browserless

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **Payments:** Stripe
- **Monitoring:** Vercel Analytics

### Development
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript

---

## Database Schema

### Core Tables

#### Users & Authentication
```sql
-- Managed by Supabase Auth
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ
)
```

#### Companies
```sql
companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  plan_type TEXT,
  monthly_test_quota INTEGER,
  tests_used_this_month INTEGER,
  preferences JSONB DEFAULT '{}',  -- NEW: Company settings
  created_at TIMESTAMPTZ
)

company_members (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member'))
)
```

#### Human Testers
```sql
human_testers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  age INTEGER,
  tech_literacy TEXT,
  total_tests_completed INTEGER DEFAULT 0,
  average_rating DECIMAL,
  is_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',  -- NEW: Tester preferences
  stats JSONB DEFAULT '{}',        -- NEW: Performance stats
  created_at TIMESTAMPTZ
)
```

#### Test Runs
```sql
test_runs (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  tester_id UUID REFERENCES human_testers(id),
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  persona JSONB NOT NULL,
  platform platform_type NOT NULL,  -- 'web' | 'mobile'
  test_type TEXT,
  status test_status,
  company_ai_rating INTEGER CHECK (company_ai_rating BETWEEN 1 AND 5),
  sentiment_score FLOAT,
  final_report TEXT,
  
  -- NEW: Enhanced metadata
  platform_details JSONB,  -- Browser, device, console details
  test_config JSONB,       -- Viewport, network, geolocation
  ai_metadata JSONB,       -- Models used, costs, tokens
  
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

#### Issues
```sql
issues (
  id UUID PRIMARY KEY,
  test_run_id UUID REFERENCES test_runs(id),
  company_id UUID REFERENCES companies(id),
  tester_id UUID REFERENCES human_testers(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity severity_level,  -- 'low' | 'medium' | 'high' | 'critical'
  status TEXT,
  screenshot_url TEXT,
  metadata JSONB,  -- NEW: Repro steps, console errors, etc.
  created_at TIMESTAMPTZ
)
```

### Progressive Unlock System

#### Platform Milestones
```sql
platform_milestones (
  id UUID PRIMARY KEY,
  milestone_name TEXT UNIQUE NOT NULL,
  milestone_type TEXT,  -- 'test_count' | 'quality' | 'revenue'
  current_value BIGINT DEFAULT 0,
  target_value BIGINT NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlock_phase TEXT,  -- 'phase2' | 'phase3' | 'phase4'
  unlocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### AI Training Data
```sql
ai_training_data (
  id UUID PRIMARY KEY,
  test_run_id UUID REFERENCES test_runs(id),
  tester_id UUID REFERENCES human_testers(id),
  company_id UUID REFERENCES companies(id),
  input_data JSONB NOT NULL,
  expected_output JSONB NOT NULL,
  actual_output JSONB,
  human_feedback JSONB,
  quality_score INTEGER,
  is_high_quality BOOLEAN,
  human_verified BOOLEAN DEFAULT false,
  model_type TEXT,  -- 'issue_detector' | 'strategy_planner' | 'sentiment_analyzer'
  created_at TIMESTAMPTZ
)

ai_models (
  id UUID PRIMARY KEY,
  model_name TEXT UNIQUE NOT NULL,
  model_type TEXT,
  base_model TEXT,
  fine_tuned_model_id TEXT,
  training_batch_id UUID,
  phase TEXT,  -- 'phase1' | 'phase2' | 'phase3' | 'phase4'
  is_active BOOLEAN DEFAULT false,
  performance_metrics JSONB,
  deployed_at TIMESTAMPTZ
)

training_batches (
  id UUID PRIMARY KEY,
  model_type TEXT,
  training_file_url TEXT,
  openai_file_id TEXT,
  openai_job_id TEXT,
  status TEXT,  -- 'preparing' | 'uploaded' | 'training' | 'succeeded' | 'failed'
  total_examples INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

### Early Adopter Programs

#### Company Early Adopters
```sql
early_adopter_applications (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT,  -- 'founding_partner' | 'early_adopter' | 'beta_user'
  status TEXT DEFAULT 'pending',
  application_data JSONB,
  created_at TIMESTAMPTZ
)

early_adopter_companies (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  tier TEXT NOT NULL,
  discount_percentage INTEGER,
  benefits JSONB,
  joined_at TIMESTAMPTZ
)
```

#### Founding Testers
```sql
founding_tester_applications (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT,  -- 'founding_tester' | 'early_tester' | 'beta_tester'
  status TEXT DEFAULT 'pending',
  application_data JSONB,
  created_at TIMESTAMPTZ
)

founding_testers (
  id UUID PRIMARY KEY,
  tester_id UUID REFERENCES human_testers(id),
  tier TEXT NOT NULL,
  revenue_share_percentage INTEGER,
  equity_percentage DECIMAL,
  benefits JSONB,
  joined_at TIMESTAMPTZ
)

tester_equity_vesting (
  id UUID PRIMARY KEY,
  tester_id UUID REFERENCES founding_testers(id),
  total_equity_percentage DECIMAL,
  vested_percentage DECIMAL DEFAULT 0,
  vesting_start_date DATE,
  vesting_cliff_months INTEGER DEFAULT 6,
  vesting_period_months INTEGER DEFAULT 24,
  next_vesting_date DATE
)
```

### Platform Presets (NEW)
```sql
platform_presets (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,  -- 'web' | 'mobile' | 'console' | 'vr'
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

---

## AI System

### Phase 1: External APIs (Current)

**Active Models:**
- **GPT-4o-mini:** Simple tasks (strategy planning, basic analysis)
- **GPT-4o:** Complex tasks, vision tasks
- **Claude 3.5 Sonnet:** Critical analysis, detailed reports

**Model Selection Logic:**
```typescript
// Tiered Reasoning System
selectModel(task: TestTask): ModelConfig {
  if (task.requiresVision) return GPT_4O
  if (task.complexity === 'simple') return GPT_4O_MINI
  if (task.complexity === 'complex') return CLAUDE_3_5_SONNET
  return GPT_4O  // default
}
```

**Cost per Test:**
- Simple: ~$0.15 (GPT-4o-mini)
- Medium: ~$2.50 (GPT-4o)
- Complex: ~$3.00 (Claude 3.5)
- Average: ~$2.00 per test

### Phase 2: Fine-Tuned Models (Unlocks at 1,000 tests)

**Training Process:**
1. Collect 50+ high-quality, human-verified test examples
2. Export data in OpenAI JSONL format
3. Upload to OpenAI Fine-tuning API
4. Train specialized models (10-60 minutes)
5. Deploy and activate

**Fine-Tuned Models:**
- **Issue Detector:** Finds bugs and UX issues (base: GPT-4o-mini)
- **Strategy Planner:** Creates test strategies (base: GPT-4o-mini)
- **Sentiment Analyzer:** Analyzes user experience (base: GPT-4o)

**Expected Benefits:**
- 40% cost reduction on simple tasks
- 15% accuracy improvement
- 2x faster inference

**Cost per Test:**
- Simple: ~$0.09 (fine-tuned GPT-4o-mini)
- Medium: ~$0.60 (fine-tuned GPT-4o)
- Complex: ~$3.00 (Claude 3.5 - fallback)
- Average: ~$1.20 per test (40% reduction)

### Phase 3: Self-Hosted Models (Unlocks at 5,000 tests)

**Model Options:**
1. **Groq API** (Recommended for testing)
   - Ultra-fast LLaMA 3.1 8B inference
   - ~$0.05 per 1M tokens
   - No infrastructure needed

2. **Self-Hosted LLaMA 8B**
   - Requires GPU (16GB+ VRAM)
   - Docker + HuggingFace TGI
   - ~$0.03 per test (infrastructure cost)

3. **Self-Hosted Mixtral 8x7B**
   - Requires multi-GPU (48GB+ VRAM)
   - Better quality than LLaMA 8B
   - ~$0.05 per test

**Model Selection Logic:**
```typescript
// Phase 3 routing
if (currentPhase >= 'phase3') {
  if (task.complexity === 'simple') return LLAMA_8B
  if (task.complexity === 'medium') return MIXTRAL_8X7B
  if (task.complexity === 'complex') return FINE_TUNED_GPT4O  // fallback
}
```

**Cost per Test:**
- Simple: ~$0.05 (LLaMA 8B)
- Medium: ~$0.15 (Mixtral 8x7B)
- Complex: ~$0.60 (fine-tuned GPT-4o)
- Average: ~$0.60 per test (70% reduction)

### Phase 4: Full Hybrid (Unlocks at 10,000 tests)

**Advanced Features:**
- Multi-model ensemble voting
- Dynamic model selection based on real-time performance
- Custom routing based on test type
- Automatic A/B testing of models
- Cost-quality optimization

**Expected Cost:**
- Average: ~$0.40 per test (80% reduction from Phase 1)

### Training Data Collection

**Automatic Collection:**
Every completed test captures:
```typescript
{
  testRunId: UUID,
  inputData: {
    url: string,
    mission: string,
    persona: object,
    testType: string
  },
  aiOutput: {
    sentiment: number,
    issuesFound: Issue[],
    recommendations: string[]
  },
  humanFeedback: {
    rating: number,
    corrections: object
  },
  companyRating: number,
  modelVersion: string
}
```

**Quality Filtering:**
- Only tests rated 4+ stars
- Human-verified results
- Diverse test scenarios
- No duplicate examples

**Data Export Format (JSONL):**
```json
{"messages": [
  {"role": "system", "content": "You are an expert UX tester..."},
  {"role": "user", "content": "Test this website: https://example.com..."},
  {"role": "assistant", "content": "Found 3 critical issues..."}
]}
```

---

## Progressive Unlock System

### Milestone Gates

| Phase | Unlock Criteria | Features Unlocked | Cost Reduction |
|-------|----------------|-------------------|----------------|
| Phase 1 | Day 1 | External APIs | Baseline ($5/test) |
| Phase 2 | 1,000 tests + 500 quality tests | Fine-tuned models | 40% ($3/test) |
| Phase 3 | 5,000 tests + 2,500 quality tests | Self-hosted models | 70% ($1.50/test) |
| Phase 4 | 10,000 tests + 5,000 quality tests | Full hybrid | 80% ($1/test) |

### Milestone Tracking

**Database Function:**
```sql
CREATE FUNCTION update_milestone_progress()
RETURNS void AS $$
BEGIN
  -- Update total tests
  UPDATE platform_milestones
  SET current_value = (SELECT COUNT(*) FROM test_runs WHERE status = 'completed')
  WHERE milestone_name = 'Total Tests Completed';
  
  -- Update quality tests
  UPDATE platform_milestones
  SET current_value = (SELECT COUNT(*) FROM test_runs 
                       WHERE status = 'completed' AND company_ai_rating >= 4)
  WHERE milestone_name = 'High Quality Tests (4+ stars)';
  
  -- Check for unlocks
  UPDATE platform_milestones
  SET is_unlocked = TRUE, unlocked_at = NOW()
  WHERE current_value >= target_value AND is_unlocked = FALSE;
END;
$$ LANGUAGE plpgsql;
```

**Automatic Trigger:**
```sql
CREATE TRIGGER trigger_milestone_update
AFTER UPDATE ON test_runs
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION trigger_milestone_update();
```

### UI Components

**Progress Banner:**
- Shows next unlock milestone
- Progress bar with percentage
- Estimated days to unlock
- Displays on all pages

**Phase Progress Card:**
- Visual timeline of all 4 phases
- Individual milestone progress
- Unlock status indicators
- Benefits of each phase

**Early Adopter Card:**
- Company and tester programs
- Spots remaining counter
- Tier comparison
- Apply now CTA

---

## User Flows

### Company Flow

#### 1. Signup & Onboarding
```
/company/signup
  ↓
Enter company details
  ↓
Create account (Supabase Auth)
  ↓
Insert into companies table
  ↓
Insert into company_members table
  ↓
Redirect to /company/dashboard
```

#### 2. Request Test
```
/company/dashboard
  ↓
Click "New Test"
  ↓
/company/tests/new
  ↓
Fill form (URL, mission, persona, platform)
  ↓
POST /api/test-requests
  ↓
Insert into test_requests table
  ↓
Redirect to /company/tests/[id]
```

#### 3. Test Execution
```
Test Request Created
  ↓
Hybrid Orchestrator evaluates
  ↓
Route to AI or Human
  ↓
Execute test
  ↓
Capture training data
  ↓
Update milestone progress
  ↓
Notify company
  ↓
Company reviews results
  ↓
Rate AI performance (1-5 stars)
```

#### 4. Early Adopter Application
```
/pricing or /
  ↓
See EarlyAdopterCard
  ↓
Click "Apply Now"
  ↓
/early-adopter
  ↓
Select tier
  ↓
Fill application form
  ↓
POST /api/early-adopter/apply
  ↓
Insert into early_adopter_applications
  ↓
Redirect to /application-success?type=company
  ↓
Admin reviews
  ↓
Approval email sent
  ↓
Onboarding call scheduled
```

### Tester Flow

#### 1. Signup & Onboarding
```
/tester/signup
  ↓
Multi-step form (demographics, experience, preferences)
  ↓
Create account (Supabase Auth)
  ↓
Insert into human_testers table
  ↓
Redirect to /tester/dashboard
```

#### 2. Receive & Complete Test
```
Test assigned by admin
  ↓
Notification sent
  ↓
/tester/dashboard shows assignment
  ↓
Click "Start Test"
  ↓
/tester/tests/[id]/execute
  ↓
Complete test steps
  ↓
Submit findings
  ↓
POST /api/test-runs/[id]/submit
  ↓
Update test_runs status
  ↓
Calculate earnings
  ↓
Update tester stats
```

#### 3. Founding Tester Application
```
/tester/dashboard or /
  ↓
See Founding Tester CTA
  ↓
Click "Apply Now"
  ↓
/founding-tester
  ↓
Select tier
  ↓
Fill application form (experience, portfolio)
  ↓
POST /api/founding-tester/apply
  ↓
Insert into founding_tester_applications
  ↓
Redirect to /application-success?type=tester
  ↓
Admin reviews
  ↓
Approval email sent
  ↓
Equity documents sent
  ↓
Enhanced revenue share activated
```

### Admin Flow

#### 1. Review Applications
```
/admin/applications
  ↓
View pending applications
  ↓
Review details
  ↓
Approve or reject
  ↓
POST /api/admin/applications/[id]/review
  ↓
Update application status
  ↓
Send notification email
  ↓
If approved: Create early_adopter_companies or founding_testers record
```

#### 2. Manage Fine-Tuning
```
/admin/training
  ↓
View training data stats
  ↓
Check readiness (50+ examples)
  ↓
Click "Start Fine-Tuning"
  ↓
POST /api/admin/training/fine-tune
  ↓
Export data to JSONL
  ↓
Upload to OpenAI
  ↓
Start training job
  ↓
Poll status
  ↓
GET /api/admin/training/status/[jobId]
  ↓
When succeeded: Deploy model
  ↓
POST /api/admin/training/status/[jobId] (action: deploy)
  ↓
Update ai_models table
  ↓
Activate in tiered reasoning
```

---

## API Reference

### Test Execution

#### POST /api/test/execute
Execute a test run (AI or human).

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

**Process:**
1. Fetch test run from database
2. Update status to 'running'
3. Execute via HybridTestOrchestrator
4. Capture training data
5. Update milestone progress
6. Return results

### Milestones

#### GET /api/milestones
Get current milestone progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPhase": "phase1",
    "milestones": [
      {
        "name": "Total Tests Completed",
        "current": 4,
        "target": 1000,
        "progress": 0.4,
        "isUnlocked": false
      }
    ],
    "nextUnlock": {
      "phase": "phase2",
      "testsRemaining": 996,
      "estimatedDays": 249
    }
  }
}
```

#### POST /api/milestones
Manually trigger milestone update.

### Early Adopter Applications

#### GET /api/early-adopter/apply
Get available spots for each tier.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "founding_partner",
      "maxSpots": 10,
      "filledSpots": 0,
      "availableSpots": 10
    }
  ]
}
```

#### POST /api/early-adopter/apply
Submit company application.

**Request:**
```json
{
  "companyName": "Acme Inc",
  "contactName": "John Doe",
  "email": "john@acme.com",
  "tier": "early_adopter",
  "companySize": "11-50",
  "industry": "SaaS",
  "monthlyTestVolume": "51-100",
  "whyInterested": "..."
}
```

### Founding Tester Applications

#### POST /api/founding-tester/apply
Submit tester application.

**Request:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "tier": "early_tester",
  "yearsOfExperience": "3-5",
  "testingSpecialties": ["UX Testing", "Mobile Apps"],
  "platforms": ["Web", "iOS", "Android"],
  "availability": "10-20",
  "whyInterested": "..."
}
```

### Training & Fine-Tuning

#### GET /api/admin/training-data/stats
Get training data statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total": 150,
      "highQuality": 75,
      "humanVerified": 50,
      "readyForTraining": 50
    },
    "byModelType": {
      "issue_detector": { "total": 50, "ready": 20 },
      "strategy_planner": { "total": 50, "ready": 15 },
      "sentiment_analyzer": { "total": 50, "ready": 15 }
    }
  }
}
```

#### POST /api/admin/training/fine-tune
Start a fine-tuning job.

**Request:**
```json
{
  "modelType": "issue_detector",
  "minQuality": 4,
  "requireHumanVerification": true,
  "baseModel": "gpt-4o-mini-2024-07-18"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "ftjob-abc123",
  "batchId": "uuid",
  "estimatedCost": 12.50,
  "examplesCount": 50
}
```

#### GET /api/admin/training/status/[jobId]
Check fine-tuning job status.

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "ftjob-abc123",
    "status": "succeeded",
    "fineTunedModel": "ft:gpt-4o-mini-2024-07-18:org::abc123",
    "trainedTokens": 125000,
    "createdAt": "2026-01-16T10:00:00Z",
    "finishedAt": "2026-01-16T10:45:00Z"
  }
}
```

#### POST /api/admin/training/status/[jobId]
Deploy or cancel a fine-tuning job.

**Request:**
```json
{
  "action": "deploy",
  "modelName": "hitlai-issue-detector-v1",
  "phase": "phase2"
}
```

---

## Testing Capabilities

### What Can Be Tested

#### Web Applications
- **E-commerce:** Checkout flows, product pages, cart functionality
- **SaaS:** Signup flows, dashboards, feature workflows
- **Marketing:** Landing pages, forms, CTAs
- **Content:** Blogs, documentation, readability
- **Authentication:** Login, signup, password reset

#### Mobile Applications
- **iOS Apps:** Native and web views
- **Android Apps:** Native and web views
- **Responsive Web:** Mobile browser testing

#### Specific Test Types

1. **Functional Testing**
   - Feature workflows
   - Form submissions
   - Navigation flows
   - Search functionality
   - Filters and sorting

2. **UX Testing**
   - User experience issues
   - Confusing UI elements
   - Missing feedback
   - Unclear CTAs
   - Navigation problems

3. **Accessibility Testing**
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast
   - Alt text
   - ARIA labels

4. **Performance Testing**
   - Page load times
   - Slow interactions
   - Heavy assets
   - Render blocking

5. **Visual Testing**
   - Layout issues
   - Responsive design
   - Cross-browser compatibility
   - Mobile viewport issues

6. **Content Testing**
   - Spelling/grammar
   - Broken links
   - Missing images
   - Outdated content

### Test Personas

#### Pre-defined Personas
- **Tech-Savvy User:** Expert, low patience, finds edge cases
- **Casual User:** Average tech literacy, moderate patience
- **Senior User:** Low tech literacy, high patience, needs clarity
- **Mobile-First User:** Primarily uses mobile devices
- **Accessibility User:** Uses screen readers, keyboard navigation

#### Custom Personas
Companies can create custom personas with:
- Age range
- Tech literacy level
- Device preferences
- Goals and frustrations
- Behavior patterns

### Platform Coverage

#### Web Browsers (via platform_details)
- Chrome (Windows, macOS, Linux)
- Firefox (Windows, macOS, Linux)
- Safari (macOS, iOS)
- Edge (Windows, macOS)
- Opera, Brave

#### Mobile Devices
- **iOS:** iPhone 15 Pro, iPhone 15, iPhone 14 Pro, iPhone SE, iPad Pro, iPad Air
- **Android:** Samsung Galaxy S24 Ultra/S24, Google Pixel 8 Pro/8, OnePlus 12, Xiaomi 14 Pro, Motorola Edge 40 Pro

#### Gaming Consoles
- PlayStation 5, PS4 Pro
- Xbox Series X, Series S
- Nintendo Switch OLED, Switch
- Steam Deck

#### VR/AR Headsets
- Meta Quest 3, Quest 2
- PlayStation VR2
- Apple Vision Pro
- HTC Vive Pro 2
- Valve Index

### Test Outputs

#### AI Test Report
```json
{
  "sentiment": 0.75,
  "issues": [
    {
      "severity": "high",
      "category": "navigation",
      "description": "Back button doesn't work on checkout page",
      "element": "#checkout-back-btn",
      "screenshot": "url"
    }
  ],
  "recommendations": [
    "Add loading states to buttons",
    "Improve error messages",
    "Add breadcrumb navigation"
  ],
  "positives": [
    "Clean design",
    "Fast page load",
    "Clear CTAs"
  ]
}
```

#### Human Test Report
- Detailed step-by-step walkthrough
- Screenshots and screen recordings
- Severity ratings
- Reproduction steps
- Suggested fixes

---

## Deployment

### Environment Variables

**Required:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://hitlai.com

# AI Models
OPENAI_API_KEY=sk-proj-your-key
ANTHROPIC_API_KEY=sk-ant-your-key

# Payments
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-key

# Email
RESEND_API_KEY=re_your-key
```

**Optional (Phase 2/3):**
```env
# Phase 2: Fine-tuned models
FINE_TUNED_ISSUE_DETECTOR=ft:gpt-4o-mini-2024-07-18:org::id
FINE_TUNED_STRATEGY=ft:gpt-4o-mini-2024-07-18:org::id
FINE_TUNED_SENTIMENT=ft:gpt-4o-2024-08-06:org::id

# Phase 3: Self-hosted models
GROQ_API_KEY=gsk_your-key
LLAMA_8B_ENDPOINT=http://localhost:8000/v1
MIXTRAL_8X7B_ENDPOINT=http://localhost:8001/v1
```

### Database Migrations

**Order of execution:**
1. `20260116000001_milestone_tracking.sql`
2. `20260116000002_training_data_collection.sql`
3. `20260116000003_early_adopter_programs.sql`
4. `20260116000004_create_issues_table.sql`
5. `20260116000005_jsonb_enhancements.sql`

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
# ... etc
```

---

## Security

### Authentication
- **Provider:** Supabase Auth
- **Methods:** Email/password, magic links
- **Session:** JWT tokens with automatic refresh
- **Storage:** Secure HTTP-only cookies

### Authorization
- **Row Level Security (RLS):** All tables protected
- **Company isolation:** Users only see their company's data
- **Tester isolation:** Testers only see assigned tests
- **Admin access:** Separate admin role with elevated permissions

### Data Protection
- **Encryption at rest:** PostgreSQL encryption
- **Encryption in transit:** TLS/SSL
- **API keys:** Stored in environment variables
- **Sensitive data:** Hashed passwords, encrypted tokens

### Rate Limiting
- **API routes:** 100 requests/minute per IP
- **Test execution:** 10 concurrent tests per company
- **Fine-tuning:** 5 jobs per day

---

## Performance

### Optimization Strategies

1. **Server Components:** Reduce client-side JavaScript
2. **Image Optimization:** Next.js Image component
3. **Code Splitting:** Automatic route-based splitting
4. **Caching:** Vercel Edge Network caching
5. **Database Indexing:** Strategic indexes on frequently queried columns

### Monitoring

- **Vercel Analytics:** Page views, performance metrics
- **Error Tracking:** Automatic error logging
- **Database Performance:** Supabase query insights
- **API Latency:** Response time tracking

### Expected Performance

- **Page Load:** < 2 seconds
- **API Response:** < 500ms
- **Test Execution:** 30-120 seconds (AI), 10-30 minutes (human)
- **Fine-tuning:** 10-60 minutes

---

## Support & Maintenance

### Documentation
- Technical documentation (this file)
- API documentation
- User guides
- Video tutorials

### Support Channels
- Email: hello@hitlai.com
- In-app chat
- Documentation site
- Community forum

### Maintenance Schedule
- **Database backups:** Daily automated
- **Security updates:** Weekly
- **Feature releases:** Bi-weekly
- **Model updates:** Monthly (as phases unlock)

---

**End of Master Technical Documentation**

For specific implementation details, see:
- `DATABASE_SCHEMA.md` - Complete database documentation
- `API_DOCUMENTATION.md` - Detailed API reference
- `AI_SYSTEM.md` - AI architecture and training
- `USER_FLOWS.md` - Complete user journey maps
- `TESTING_GUIDE.md` - What and how to test
