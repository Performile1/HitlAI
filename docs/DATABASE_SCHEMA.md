# HitlAI - Complete Database Schema Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Database:** PostgreSQL 15 (Supabase)

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Progressive Unlock Tables](#progressive-unlock-tables)
5. [Early Adopter Tables](#early-adopter-tables)
6. [Indexes](#indexes)
7. [Functions & Triggers](#functions--triggers)
8. [Row Level Security](#row-level-security)
9. [Views](#views)
10. [Migration History](#migration-history)

---

## Overview

### Database Statistics

- **Total Tables:** 25+
- **Total Migrations:** 5
- **Total Functions:** 15+
- **Total Triggers:** 8+
- **Total Indexes:** 50+
- **Total RLS Policies:** 40+

### Key Features

- **Row Level Security:** All tables protected
- **JSONB Columns:** Flexible metadata storage
- **Vector Embeddings:** Semantic search capability
- **Real-time Subscriptions:** Live updates
- **Automatic Triggers:** Milestone tracking, timestamps
- **Computed Columns:** Virtual fields

---

## Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                  ┌──────────────┐
│  companies  │◄─────────────────│company_members│
└──────┬──────┘                  └──────────────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                  ┌──────────────┐
│ test_runs   │──────────────────►│    issues    │
└──────┬──────┘                  └──────────────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                  ┌──────────────┐
│ai_training_ │                  │human_testers │
│    data     │                  └──────┬───────┘
└─────────────┘                         │
                                        ▼
                                 ┌──────────────┐
                                 │founding_     │
                                 │  testers     │
                                 └──────────────┘
```

---

## Core Tables

### auth.users
Managed by Supabase Auth. Contains authentication data.

```sql
-- Managed by Supabase
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_user_meta_data JSONB,
  raw_app_meta_data JSONB
)
```

**Indexes:**
- `idx_users_email` on `email`

---

### companies

Stores company information and subscription details.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  
  -- Subscription
  plan_type TEXT CHECK (plan_type IN ('free', 'starter', 'pro', 'enterprise')),
  monthly_test_quota INTEGER DEFAULT 10,
  tests_used_this_month INTEGER DEFAULT 0,
  
  -- Billing
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  
  -- Settings (NEW)
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_companies_stripe_customer` on `stripe_customer_id`
- `idx_companies_created_at` on `created_at DESC`
- `idx_companies_preferences` GIN on `preferences`

**Preferences JSONB Structure:**
```json
{
  "notifications": {
    "email": true,
    "slack": true,
    "webhook": "https://hooks.slack.com/..."
  },
  "testDefaults": {
    "platform": "web",
    "browser": "chrome",
    "viewport": {"width": 1920, "height": 1080}
  },
  "aiPreferences": {
    "preferredModels": ["claude-3-5-sonnet"],
    "maxCostPerTest": 0.50,
    "autoApproveUnder": 0.10
  },
  "reporting": {
    "frequency": "daily",
    "format": "pdf",
    "includeScreenshots": true
  },
  "integrations": {
    "jira": {"enabled": true, "projectKey": "PROJ"},
    "github": {"enabled": true, "repo": "org/repo"}
  }
}
```

**RLS Policies:**
```sql
-- Companies can view their own data
CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

-- Companies can update their own data
CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );
```

---

### company_members

Links users to companies with roles.

```sql
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);
```

**Indexes:**
- `idx_company_members_company` on `company_id`
- `idx_company_members_user` on `user_id`
- `idx_company_members_role` on `role`

**RLS Policies:**
```sql
-- Members can view their own memberships
CREATE POLICY "Members can view own memberships"
  ON company_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Members can view other members in their company
CREATE POLICY "Members can view company members"
  ON company_members FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

-- Owners/admins can add members
CREATE POLICY "Owners can add members"
  ON company_members FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

---

### human_testers

Stores tester profiles and statistics.

```sql
CREATE TABLE human_testers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  
  -- Demographics
  age INTEGER CHECK (age > 0 AND age < 120),
  gender TEXT,
  location_country TEXT,
  location_city TEXT,
  
  -- Experience
  tech_literacy TEXT CHECK (tech_literacy IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_testing_experience INTEGER,
  occupation TEXT,
  education_level TEXT,
  
  -- Preferences
  primary_device TEXT,
  languages TEXT[],
  
  -- Stats
  total_tests_completed INTEGER DEFAULT 0,
  total_tests_assigned INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_date TIMESTAMPTZ,
  
  -- NEW: Enhanced metadata
  preferences JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_testers_user_id` on `user_id`
- `idx_testers_email` on `email`
- `idx_testers_verified` on `is_verified` WHERE `is_verified = true`
- `idx_testers_preferences` GIN on `preferences`
- `idx_testers_stats` GIN on `stats`

**Preferences JSONB Structure:**
```json
{
  "notifications": {"email": true, "push": false},
  "availability": {
    "timezone": "America/Los_Angeles",
    "hours": {"start": "09:00", "end": "17:00"},
    "daysOfWeek": ["monday", "tuesday", "wednesday"]
  },
  "testPreferences": {
    "platforms": ["web", "mobile"],
    "industries": ["ecommerce", "saas"],
    "languages": ["en", "es"]
  }
}
```

**Stats JSONB Structure:**
```json
{
  "totalTests": 156,
  "avgRating": 4.8,
  "avgTimePerTest": 1200,
  "specialties": ["ecommerce", "mobile"],
  "topIssuesFound": ["navigation", "forms", "checkout"],
  "earningsTotal": 3120.00,
  "earningsThisMonth": 480.00,
  "streak": 12,
  "badges": ["top_performer", "bug_hunter", "speed_demon"]
}
```

**RLS Policies:**
```sql
-- Testers can view their own profile
CREATE POLICY "Testers can view own profile"
  ON human_testers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Testers can update their own profile
CREATE POLICY "Testers can update own profile"
  ON human_testers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Testers can insert their profile during signup
CREATE POLICY "Testers can create profile"
  ON human_testers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

---

### test_runs

Core table storing all test execution data.

```sql
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  
  -- Test Configuration
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  persona JSONB NOT NULL,
  platform platform_type NOT NULL,  -- ENUM: 'web' | 'mobile'
  test_type TEXT CHECK (test_type IN ('ai_only', 'human_only', 'hybrid')),
  additional_context TEXT,
  
  -- Execution
  status test_status NOT NULL DEFAULT 'pending',
  -- ENUM: 'pending' | 'running' | 'hitl_paused' | 'completed' | 'failed'
  current_step_index INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- Results
  sentiment_score FLOAT CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  crawl_context TEXT,
  semantic_schema JSONB,
  audit_results JSONB,
  final_report TEXT,
  
  -- Rating
  company_ai_rating INTEGER CHECK (company_ai_rating BETWEEN 1 AND 5),
  company_feedback TEXT,
  
  -- NEW: Enhanced Metadata
  platform_details JSONB,  -- Browser, device, console details
  test_config JSONB,       -- Viewport, network, geolocation
  ai_metadata JSONB,       -- Models used, costs, tokens
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_test_runs_company` on `company_id`
- `idx_test_runs_tester` on `tester_id`
- `idx_test_runs_status` on `status`
- `idx_test_runs_created_at` on `created_at DESC`
- `idx_test_runs_platform_details` GIN on `platform_details`
- `idx_test_runs_test_config` GIN on `test_config`
- `idx_test_runs_ai_metadata` GIN on `ai_metadata`

**Platform Details JSONB Examples:**
```json
// Web
{
  "type": "web",
  "browser": "chrome",
  "browserVersion": "120.0",
  "os": "windows",
  "osVersion": "11",
  "screenSize": "1920x1080"
}

// Mobile
{
  "type": "mobile",
  "os": "ios",
  "osVersion": "17.2",
  "device": "iPhone 15 Pro",
  "manufacturer": "Apple",
  "screenSize": "393x852"
}

// Console
{
  "type": "console",
  "platform": "playstation",
  "model": "PS5",
  "manufacturer": "Sony"
}
```

**Test Config JSONB Structure:**
```json
{
  "viewport": {"width": 1920, "height": 1080},
  "networkSpeed": "4g",
  "geolocation": {"country": "US", "city": "San Francisco"},
  "cookies": true,
  "javascript": true,
  "adBlocker": false,
  "userAgent": "custom-ua-string",
  "timeout": 30000,
  "screenshots": true,
  "videoRecording": true
}
```

**AI Metadata JSONB Structure:**
```json
{
  "phase": "phase1",
  "models": {
    "strategy": {
      "name": "gpt-4o-mini",
      "version": "2024-07-18",
      "cost": 0.0002
    },
    "vision": {
      "name": "claude-3-5-sonnet",
      "version": "20241022",
      "cost": 0.003
    }
  },
  "totalCost": 0.0062,
  "tokensUsed": 2500,
  "inferenceTime": 4.2
}
```

**RLS Policies:**
```sql
-- Companies can view their own tests
CREATE POLICY "Companies can view own tests"
  ON test_runs FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

-- Testers can view assigned tests
CREATE POLICY "Testers can view assigned tests"
  ON test_runs FOR SELECT
  TO authenticated
  USING (
    tester_id IN (
      SELECT id FROM human_testers
      WHERE user_id = auth.uid()
    )
  );
```

---

### issues

Tracks bugs and issues found during testing.

```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  
  -- Issue Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity severity_level NOT NULL,
  -- ENUM: 'low' | 'medium' | 'high' | 'critical'
  status TEXT NOT NULL DEFAULT 'open',
  -- CHECK: 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
  
  -- Context
  url TEXT,
  element_selector TEXT,
  screenshot_url TEXT,
  video_url TEXT,
  
  -- Categorization
  category TEXT,  -- 'navigation' | 'forms' | 'performance' | 'accessibility'
  tags TEXT[],
  
  -- NEW: Enhanced Metadata
  metadata JSONB,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_issues_test_run` on `test_run_id`
- `idx_issues_company` on `company_id`
- `idx_issues_tester` on `tester_id`
- `idx_issues_status` on `status`
- `idx_issues_severity` on `severity`
- `idx_issues_metadata` GIN on `metadata`

**Metadata JSONB Structure:**
```json
{
  "reproSteps": [
    "Click login",
    "Enter email",
    "Submit"
  ],
  "expectedBehavior": "Should redirect to dashboard",
  "actualBehavior": "Shows 404 error",
  "affectedUsers": "All mobile users",
  "frequency": "100%",
  "firstSeen": "2026-01-15T10:00:00Z",
  "relatedIssues": ["issue-123", "issue-456"],
  "tags": ["mobile", "authentication", "critical"],
  "screenshots": ["url1", "url2"],
  "videoUrl": "recording-url",
  "consoleErrors": ["Error: Cannot read property..."]
}
```

---

## Progressive Unlock Tables

### platform_milestones

Tracks progress toward phase unlocks.

```sql
CREATE TABLE platform_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Milestone Definition
  milestone_name TEXT UNIQUE NOT NULL,
  milestone_type TEXT NOT NULL,
  -- CHECK: 'test_count' | 'quality' | 'revenue' | 'training_data'
  description TEXT,
  
  -- Progress
  current_value BIGINT DEFAULT 0,
  target_value BIGINT NOT NULL,
  
  -- Unlock
  is_unlocked BOOLEAN DEFAULT false,
  unlock_phase TEXT,  -- 'phase2' | 'phase3' | 'phase4'
  unlocked_at TIMESTAMPTZ,
  
  -- Metadata
  display_order INTEGER,
  icon TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Initial Data:**
```sql
INSERT INTO platform_milestones (milestone_name, milestone_type, target_value, unlock_phase) VALUES
('Total Tests Completed', 'test_count', 1000, 'phase2'),
('High Quality Tests (4+ stars)', 'quality', 500, 'phase2'),
('Training Batch Ready', 'training_data', 50, 'phase2'),
('Phase 3 Test Count', 'test_count', 5000, 'phase3'),
('Phase 3 Quality Tests', 'quality', 2500, 'phase3'),
('Phase 4 Test Count', 'test_count', 10000, 'phase4'),
('Phase 4 Quality Tests', 'quality', 5000, 'phase4');
```

**Indexes:**
- `idx_milestones_phase` on `unlock_phase`
- `idx_milestones_unlocked` on `is_unlocked`

---

### ai_training_data

Stores training data for AI fine-tuning.

```sql
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Training Data
  input_data JSONB NOT NULL,
  expected_output JSONB NOT NULL,
  actual_output JSONB,
  human_feedback JSONB,
  
  -- Quality
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
  is_high_quality BOOLEAN GENERATED ALWAYS AS (quality_score >= 4) STORED,
  human_verified BOOLEAN DEFAULT false,
  
  -- Model Type
  model_type TEXT NOT NULL,
  -- CHECK: 'issue_detector' | 'strategy_planner' | 'sentiment_analyzer'
  
  -- Usage
  used_in_training BOOLEAN DEFAULT false,
  training_batch_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_training_data_test_run` on `test_run_id`
- `idx_training_data_model_type` on `model_type`
- `idx_training_data_quality` on `is_high_quality` WHERE `is_high_quality = true`
- `idx_training_data_verified` on `human_verified` WHERE `human_verified = true`

---

### ai_models

Tracks deployed AI models.

```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Model Info
  model_name TEXT UNIQUE NOT NULL,
  model_type TEXT NOT NULL,
  base_model TEXT NOT NULL,
  fine_tuned_model_id TEXT,
  
  -- Training
  training_batch_id UUID,
  training_examples_count INTEGER,
  training_cost DECIMAL(10,4),
  
  -- Deployment
  phase TEXT NOT NULL,  -- 'phase1' | 'phase2' | 'phase3' | 'phase4'
  is_active BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  deprecated_at TIMESTAMPTZ,
  
  -- Performance
  performance_metrics JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Performance Metrics JSONB:**
```json
{
  "accuracy": 0.92,
  "precision": 0.89,
  "recall": 0.94,
  "f1Score": 0.91,
  "avgInferenceTime": 1.2,
  "avgCost": 0.0003,
  "totalInferences": 5000,
  "errorRate": 0.02
}
```

---

### training_batches

Tracks fine-tuning jobs.

```sql
CREATE TABLE training_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Batch Info
  model_type TEXT NOT NULL,
  base_model TEXT NOT NULL,
  
  -- Files
  training_file_url TEXT,
  training_file_path TEXT,
  openai_file_id TEXT,
  
  -- Job
  openai_job_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'preparing',
  -- CHECK: 'preparing' | 'uploaded' | 'training' | 'succeeded' | 'failed' | 'cancelled'
  
  -- Metrics
  total_examples INTEGER,
  trained_tokens BIGINT,
  estimated_cost DECIMAL(10,4),
  actual_cost DECIMAL(10,4),
  
  -- Result
  fine_tuned_model_id TEXT,
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

## Early Adopter Tables

### early_adopter_applications

Company applications for early adopter program.

```sql
CREATE TABLE early_adopter_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company Info
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  
  -- Application
  tier TEXT NOT NULL,
  -- CHECK: 'founding_partner' | 'early_adopter' | 'beta_user'
  status TEXT NOT NULL DEFAULT 'pending',
  -- CHECK: 'pending' | 'approved' | 'rejected'
  
  -- Details
  company_size TEXT,
  industry TEXT,
  monthly_test_volume TEXT,
  current_testing_approach TEXT,
  why_interested TEXT,
  
  -- Full application data
  application_data JSONB,
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### early_adopter_companies

Approved early adopter companies.

```sql
CREATE TABLE early_adopter_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID REFERENCES early_adopter_applications(id),
  
  -- Tier
  tier TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  
  -- Benefits
  benefits JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### founding_tester_applications

Tester applications for founding tester program.

```sql
CREATE TABLE founding_tester_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tester Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Application
  tier TEXT NOT NULL,
  -- CHECK: 'founding_tester' | 'early_tester' | 'beta_tester'
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Experience
  years_of_experience TEXT,
  testing_specialties TEXT[],
  platforms TEXT[],
  availability TEXT,
  
  -- Motivation
  why_interested TEXT,
  relevant_experience TEXT,
  sample_work TEXT,
  
  -- Full application data
  application_data JSONB,
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### founding_testers

Approved founding testers.

```sql
CREATE TABLE founding_testers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  tester_id UUID UNIQUE NOT NULL REFERENCES human_testers(id) ON DELETE CASCADE,
  application_id UUID REFERENCES founding_tester_applications(id),
  
  -- Tier
  tier TEXT NOT NULL,
  revenue_share_percentage INTEGER NOT NULL,
  equity_percentage DECIMAL(5,4),
  
  -- Benefits
  benefits JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### tester_equity_vesting

Tracks equity vesting for founding testers.

```sql
CREATE TABLE tester_equity_vesting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  tester_id UUID UNIQUE NOT NULL REFERENCES founding_testers(id) ON DELETE CASCADE,
  
  -- Equity
  total_equity_percentage DECIMAL(5,4) NOT NULL,
  vested_percentage DECIMAL(5,4) DEFAULT 0,
  
  -- Schedule
  vesting_start_date DATE NOT NULL,
  vesting_cliff_months INTEGER DEFAULT 6,
  vesting_period_months INTEGER DEFAULT 24,
  
  -- Next Vesting
  next_vesting_date DATE,
  next_vesting_amount DECIMAL(5,4),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Platform Presets

### platform_presets

Predefined platform configurations.

```sql
CREATE TABLE platform_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Preset Info
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  -- CHECK: 'web' | 'mobile' | 'console' | 'vr' | 'desktop'
  
  -- Configuration
  config JSONB NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Initial Data:** 40+ presets including:
- 12 web browsers (Chrome, Firefox, Safari, Edge, etc.)
- 13 mobile devices (iPhone, Samsung, Pixel, etc.)
- 7 gaming consoles (PS5, Xbox, Switch, etc.)
- 6 VR/AR headsets (Quest, PSVR2, Vision Pro, etc.)

---

## Functions & Triggers

### Milestone Update Function

```sql
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS void AS $$
BEGIN
  -- Update total tests
  UPDATE platform_milestones
  SET current_value = (SELECT COUNT(*) FROM test_runs WHERE status = 'completed'),
      updated_at = NOW()
  WHERE milestone_name = 'Total Tests Completed';
  
  -- Update quality tests
  UPDATE platform_milestones
  SET current_value = (SELECT COUNT(*) FROM test_runs 
                       WHERE status = 'completed' AND company_ai_rating >= 4),
      updated_at = NOW()
  WHERE milestone_name = 'High Quality Tests (4+ stars)';
  
  -- Check for unlocks
  UPDATE platform_milestones
  SET is_unlocked = TRUE, unlocked_at = NOW(), updated_at = NOW()
  WHERE current_value >= target_value AND is_unlocked = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Milestone Trigger

```sql
CREATE OR REPLACE FUNCTION trigger_milestone_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM update_milestone_progress();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_test_completion_milestone
AFTER UPDATE ON test_runs
FOR EACH ROW
EXECUTE FUNCTION trigger_milestone_update();
```

### Updated At Triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_test_runs_updated_at
  BEFORE UPDATE ON test_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... etc for other tables
```

---

## Views

### phase_unlock_status

```sql
CREATE OR REPLACE VIEW phase_unlock_status AS
SELECT 
  unlock_phase as phase,
  COUNT(*) as total_milestones,
  COUNT(*) FILTER (WHERE is_unlocked) as unlocked_milestones,
  BOOL_AND(is_unlocked) as phase_unlocked
FROM platform_milestones
WHERE unlock_phase IS NOT NULL
GROUP BY unlock_phase;
```

### v_tests_with_platform

```sql
CREATE OR REPLACE VIEW v_tests_with_platform AS
SELECT 
  id,
  url,
  status,
  platform as legacy_platform,
  platform_details->>'type' as platform_type,
  platform_details->>'browser' as browser,
  platform_details->>'os' as os,
  platform_details->>'device' as device,
  platform_details,
  created_at
FROM test_runs
WHERE platform_details IS NOT NULL;
```

### v_ai_cost_summary

```sql
CREATE OR REPLACE VIEW v_ai_cost_summary AS
SELECT 
  DATE(created_at) as test_date,
  COUNT(*) as total_tests,
  SUM((ai_metadata->>'totalCost')::NUMERIC) as total_cost,
  AVG((ai_metadata->>'totalCost')::NUMERIC) as avg_cost_per_test,
  ai_metadata->>'phase' as ai_phase
FROM test_runs
WHERE ai_metadata IS NOT NULL
GROUP BY DATE(created_at), ai_metadata->>'phase'
ORDER BY test_date DESC;
```

---

## Migration History

1. **20260108_initial_schema.sql** - Core tables, enums, indexes
2. **20260116000001_milestone_tracking.sql** - Progressive unlock system
3. **20260116000002_training_data_collection.sql** - AI training tables
4. **20260116000003_early_adopter_programs.sql** - Early adopter tables
5. **20260116000004_create_issues_table.sql** - Issues tracking
6. **20260116000005_jsonb_enhancements.sql** - JSONB metadata columns + platform presets

---

**End of Database Schema Documentation**
