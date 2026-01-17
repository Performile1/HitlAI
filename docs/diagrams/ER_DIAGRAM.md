# HitlAI - Entity Relationship Diagram

**Version:** 1.0  
**Last Updated:** January 16, 2026

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HitlAI Database Schema                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│     companies        │         │   company_members    │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │────┐    │ id (PK)              │
│ name                 │    │    │ company_id (FK)      │
│ email                │    └───▶│ user_id (FK)         │
│ industry             │         │ role                 │
│ company_size         │         │ invited_at           │
│ tests_used_this_month│         │ joined_at            │
│ monthly_test_quota   │         └──────────────────────┘
│ plan_type            │
│ stripe_customer_id   │
│ early_adopter_tier   │
│ discount_percentage  │
│ created_at           │
└──────────────────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────────┐         ┌──────────────────────┐
│     test_runs        │         │       issues         │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │────┐    │ id (PK)              │
│ company_id (FK)      │    │    │ test_run_id (FK)     │
│ tester_id (FK)       │    └───▶│ title                │
│ url                  │         │ description          │
│ mission              │         │ severity             │
│ test_type            │         │ category             │
│ persona              │         │ element_selector     │
│ platform_details     │         │ screenshot_url       │
│ status               │         │ metadata (JSONB)     │
│ sentiment_score      │         │ created_at           │
│ issues_found         │         └──────────────────────┘
│ recommendations      │
│ positives            │
│ final_report         │
│ cost                 │
│ ai_model_used        │
│ company_ai_rating    │
│ execution_time_ms    │
│ created_at           │
│ completed_at         │
└──────────────────────┘
         │
         │ N:1
         │
         ▼
┌──────────────────────┐         ┌──────────────────────┐
│   human_testers      │         │  tester_assignments  │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │────┐    │ id (PK)              │
│ user_id (FK)         │    │    │ test_run_id (FK)     │
│ email                │    └───▶│ tester_id (FK)       │
│ display_name         │         │ assigned_at          │
│ age                  │         │ started_at           │
│ gender               │         │ completed_at         │
│ occupation           │         │ status               │
│ education_level      │         └──────────────────────┘
│ location_country     │
│ tech_literacy        │
│ primary_device       │
│ languages            │
│ years_of_testing_exp │
│ previous_platforms   │
│ is_verified          │
│ average_rating       │
│ tests_completed      │
│ total_earnings       │
│ founding_tester_tier │
│ revenue_share_pct    │
│ equity_percentage    │
│ created_at           │
└──────────────────────┘


┌──────────────────────┐         ┌──────────────────────┐
│     milestones       │         │  early_adopter_apps  │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ phase                │         │ company_name         │
│ tests_required       │         │ contact_name         │
│ tests_completed      │         │ email                │
│ is_unlocked          │         │ phone                │
│ unlocked_at          │         │ website              │
│ created_at           │         │ company_size         │
│ updated_at           │         │ industry             │
└──────────────────────┘         │ monthly_test_volume  │
                                 │ current_approach     │
                                 │ why_interested       │
                                 │ selected_tier        │
                                 │ status               │
                                 │ reviewed_by          │
                                 │ reviewed_at          │
                                 │ created_at           │
                                 └──────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│ founding_tester_apps │         │   training_data      │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ full_name            │         │ test_run_id (FK)     │
│ email                │         │ input_data (JSONB)   │
│ phone                │         │ output_data (JSONB)  │
│ location             │         │ rating               │
│ linkedin_url         │         │ model_type           │
│ portfolio_url        │         │ used_for_training    │
│ years_experience     │         │ created_at           │
│ specialties          │         └──────────────────────┘
│ platforms            │
│ availability_hours   │
│ why_interested       │
│ relevant_experience  │
│ sample_work_url      │
│ selected_tier        │
│ status               │
│ reviewed_by          │
│ reviewed_at          │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   fine_tuning_jobs   │         │      webhooks        │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ job_id               │         │ company_id (FK)      │
│ model_type           │         │ url                  │
│ status               │         │ events               │
│ training_file_id     │         │ secret               │
│ fine_tuned_model_id  │         │ is_active            │
│ hyperparameters      │         │ created_at           │
│ created_at           │         └──────────────────────┘
│ completed_at         │
│ error_message        │
└──────────────────────┘
```

---

## Detailed Entity Relationships

### Core Entities

#### 1. companies → test_runs (1:N)
- One company can create many test runs
- Foreign key: `test_runs.company_id` references `companies.id`
- RLS: Companies can only see their own test runs

#### 2. test_runs → issues (1:N)
- One test run can have many issues
- Foreign key: `issues.test_run_id` references `test_runs.id`
- Cascade delete: When test run is deleted, issues are deleted

#### 3. human_testers → test_runs (1:N)
- One tester can complete many test runs
- Foreign key: `test_runs.tester_id` references `human_testers.id`
- Nullable: AI-only tests have null tester_id

#### 4. companies → company_members (1:N)
- One company can have many members
- Foreign key: `company_members.company_id` references `companies.id`
- Used for team collaboration

#### 5. test_runs → tester_assignments (1:N)
- One test run can be assigned to multiple testers (for hybrid)
- Foreign key: `tester_assignments.test_run_id` references `test_runs.id`

#### 6. test_runs → training_data (1:1)
- High-quality test runs (rating 4+) become training data
- Foreign key: `training_data.test_run_id` references `test_runs.id`

---

## JSONB Field Structures

### test_runs.platform_details (JSONB)
```json
{
  "type": "web|mobile|console|vr",
  "browser": "chrome|firefox|safari|edge",
  "device": "desktop|mobile|tablet",
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "os": "windows|macos|linux|ios|android",
  "version": "120.0.0"
}
```

### issues.metadata (JSONB)
```json
{
  "reproduction_steps": ["Step 1", "Step 2"],
  "expected_behavior": "Should display...",
  "actual_behavior": "Shows error...",
  "browser_console_errors": ["Error 1", "Error 2"],
  "network_requests": [
    {
      "url": "https://api.example.com",
      "status": 404,
      "method": "GET"
    }
  ],
  "device_info": {
    "user_agent": "Mozilla/5.0...",
    "screen_resolution": "1920x1080"
  }
}
```

### human_testers.languages (Array)
```json
["English", "Spanish", "French"]
```

### human_testers.specialties (Array)
```json
["UX Testing", "Accessibility", "Performance"]
```

### training_data.input_data (JSONB)
```json
{
  "url": "https://example.com",
  "mission": "Test checkout flow",
  "persona": "casual_user",
  "platform": "web"
}
```

### training_data.output_data (JSONB)
```json
{
  "sentiment_score": 0.75,
  "issues": [
    {
      "title": "Payment form validation broken",
      "severity": "critical"
    }
  ],
  "recommendations": ["Fix validation", "Add loading state"],
  "positives": ["Fast page load", "Clear UI"]
}
```

---

## Indexes

### Performance Indexes
```sql
-- test_runs
CREATE INDEX idx_test_runs_company_id ON test_runs(company_id);
CREATE INDEX idx_test_runs_tester_id ON test_runs(tester_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_created_at ON test_runs(created_at DESC);

-- issues
CREATE INDEX idx_issues_test_run_id ON issues(test_run_id);
CREATE INDEX idx_issues_severity ON issues(severity);

-- human_testers
CREATE INDEX idx_human_testers_user_id ON human_testers(user_id);
CREATE INDEX idx_human_testers_is_verified ON human_testers(is_verified);

-- companies
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_stripe_customer_id ON companies(stripe_customer_id);
```

### JSONB Indexes
```sql
-- Search within platform_details
CREATE INDEX idx_test_runs_platform_type 
ON test_runs((platform_details->>'type'));

-- Search within issues metadata
CREATE INDEX idx_issues_metadata 
ON issues USING gin(metadata);
```

---

## Constraints

### Primary Keys
- All tables have `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`

### Foreign Keys
```sql
-- test_runs
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
FOREIGN KEY (tester_id) REFERENCES human_testers(id) ON DELETE SET NULL

-- issues
FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE

-- company_members
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE

-- tester_assignments
FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE
FOREIGN KEY (tester_id) REFERENCES human_testers(id) ON DELETE CASCADE

-- training_data
FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE
```

### Unique Constraints
```sql
-- companies
UNIQUE(email)

-- human_testers
UNIQUE(user_id)
UNIQUE(email)

-- company_members
UNIQUE(company_id, user_id)

-- webhooks
UNIQUE(company_id, url)
```

### Check Constraints
```sql
-- test_runs
CHECK (sentiment_score >= 0 AND sentiment_score <= 1)
CHECK (cost >= 0)
CHECK (test_type IN ('ai', 'human', 'hybrid'))
CHECK (status IN ('pending', 'running', 'completed', 'failed'))

-- issues
CHECK (severity IN ('low', 'medium', 'high', 'critical'))

-- human_testers
CHECK (age >= 18)
CHECK (average_rating >= 0 AND average_rating <= 5)
CHECK (revenue_share_pct >= 0 AND revenue_share_pct <= 100)

-- companies
CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
CHECK (monthly_test_quota >= 0)
```

---

## RLS Policies

### companies
```sql
-- Companies can only see their own data
CREATE POLICY "Companies can view own data"
ON companies FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM company_members 
  WHERE company_id = companies.id
));
```

### test_runs
```sql
-- Companies see their own tests
CREATE POLICY "Companies can view own tests"
ON test_runs FOR SELECT
USING (company_id IN (
  SELECT company_id FROM company_members 
  WHERE user_id = auth.uid()
));

-- Testers see assigned tests
CREATE POLICY "Testers can view assigned tests"
ON test_runs FOR SELECT
USING (tester_id IN (
  SELECT id FROM human_testers 
  WHERE user_id = auth.uid()
));
```

### human_testers
```sql
-- Testers can only see their own profile
CREATE POLICY "Testers can view own profile"
ON human_testers FOR SELECT
USING (user_id = auth.uid());
```

---

## Triggers

### update_milestone_progress
```sql
CREATE TRIGGER update_milestone_progress_trigger
AFTER INSERT ON test_runs
FOR EACH ROW
EXECUTE FUNCTION update_milestone_progress();
```

### capture_training_data
```sql
CREATE TRIGGER capture_training_data_trigger
AFTER UPDATE ON test_runs
FOR EACH ROW
WHEN (NEW.company_ai_rating >= 4)
EXECUTE FUNCTION capture_training_data();
```

### update_tester_stats
```sql
CREATE TRIGGER update_tester_stats_trigger
AFTER UPDATE ON test_runs
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_tester_stats();
```

---

## Views

### company_stats
```sql
CREATE VIEW company_stats AS
SELECT 
  c.id,
  c.name,
  COUNT(tr.id) as total_tests,
  AVG(tr.sentiment_score) as avg_sentiment,
  SUM(tr.cost) as total_spent,
  c.tests_used_this_month,
  c.monthly_test_quota
FROM companies c
LEFT JOIN test_runs tr ON tr.company_id = c.id
GROUP BY c.id;
```

### tester_performance
```sql
CREATE VIEW tester_performance AS
SELECT 
  ht.id,
  ht.display_name,
  ht.tests_completed,
  ht.average_rating,
  ht.total_earnings,
  COUNT(tr.id) as active_assignments
FROM human_testers ht
LEFT JOIN test_runs tr ON tr.tester_id = ht.id 
  AND tr.status IN ('pending', 'running')
GROUP BY ht.id;
```

---

**End of ER Diagram**
