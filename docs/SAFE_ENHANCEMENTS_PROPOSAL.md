# Safe System Enhancements - JSONB Approach

These are low-risk, high-value enhancements using the same JSONB pattern as the platform_details migration.

---

## 1. Platform Details (Already Discussed) ⭐

**Migration:**
```sql
ALTER TABLE test_runs ADD COLUMN platform_details JSONB;
CREATE INDEX idx_test_runs_platform_details ON test_runs USING GIN (platform_details);
```

**Value:** Browser/device/console tracking, better bug reports, platform-specific AI training

---

## 2. Test Configuration Metadata ⭐⭐

**Problem:** Test configuration is scattered across multiple columns and hard to extend.

**Migration:**
```sql
ALTER TABLE test_runs ADD COLUMN test_config JSONB;
CREATE INDEX idx_test_runs_test_config ON test_runs USING GIN (test_config);
```

**Example Data:**
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

**Benefits:**
- Store any test configuration without schema changes
- A/B test different configurations
- Reproduce exact test conditions
- Better debugging ("This only fails with adBlocker enabled")

---

## 3. AI Model Metadata ⭐⭐⭐

**Problem:** Can't track which AI model/version was used for each test.

**Migration:**
```sql
ALTER TABLE test_runs ADD COLUMN ai_metadata JSONB;
CREATE INDEX idx_test_runs_ai_metadata ON test_runs USING GIN (ai_metadata);
```

**Example Data:**
```json
{
  "phase": "phase1",
  "models": {
    "strategy": {"name": "gpt-4o-mini", "version": "2024-07-18", "cost": 0.0002},
    "vision": {"name": "claude-3-5-sonnet", "version": "20241022", "cost": 0.003},
    "critique": {"name": "claude-3-5-sonnet", "version": "20241022", "cost": 0.003}
  },
  "totalCost": 0.0062,
  "tokensUsed": 2500,
  "inferenceTime": 4.2
}
```

**Benefits:**
- Track cost per test accurately
- Compare model performance (GPT-4 vs Claude vs fine-tuned)
- Identify which models find the most bugs
- **Critical for Phase 2/3:** Know when fine-tuned models are being used
- ROI analysis ("Fine-tuned models save $X per test")

---

## 4. Issue Metadata Enhancement ⭐⭐

**Problem:** Issues table is rigid, can't store rich context.

**Migration:**
```sql
ALTER TABLE issues ADD COLUMN metadata JSONB;
CREATE INDEX idx_issues_metadata ON issues USING GIN (metadata);
```

**Example Data:**
```json
{
  "reproSteps": ["Click login", "Enter email", "Submit"],
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

**Benefits:**
- Richer bug reports
- Better issue tracking
- Easier to categorize and search
- AI can learn from detailed issue patterns

---

## 5. Persona Enhancement ⭐⭐⭐

**Problem:** Persona is already JSONB, but we could standardize and enrich it.

**Current:** Inconsistent structure
**Proposed:** Standardized schema with validation

**Migration:**
```sql
-- Add validation function
CREATE OR REPLACE FUNCTION validate_persona(persona JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    persona ? 'name' AND
    persona ? 'age' AND
    persona ? 'techLiteracy' AND
    persona ? 'goals'
  );
END;
$$ LANGUAGE plpgsql;

-- Add check constraint (optional)
ALTER TABLE test_runs ADD CONSTRAINT valid_persona 
  CHECK (validate_persona(persona));
```

**Standardized Persona:**
```json
{
  "name": "Tech-Savvy Developer",
  "age": 32,
  "occupation": "Software Engineer",
  "techLiteracy": "expert",
  "goals": ["Find technical bugs", "Test edge cases"],
  "frustrations": ["Slow loading", "Unclear error messages"],
  "devices": ["MacBook Pro", "iPhone 15"],
  "preferredBrowsers": ["Chrome", "Firefox"],
  "accessibility": {
    "screenReader": false,
    "colorBlind": false,
    "keyboardOnly": false
  },
  "behavior": {
    "patience": "low",
    "explorationStyle": "methodical",
    "feedbackDetail": "high"
  }
}
```

**Benefits:**
- Better AI persona matching
- More realistic test scenarios
- Accessibility testing support
- Consistent persona data for training

---

## 6. Company Settings/Preferences ⭐

**Problem:** Company preferences are scattered or hardcoded.

**Migration:**
```sql
ALTER TABLE companies ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_companies_preferences ON companies USING GIN (preferences);
```

**Example Data:**
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

**Benefits:**
- Customizable per company
- No schema changes for new preferences
- Easy A/B testing of features
- Better UX (remember user preferences)

---

## 7. Tester Preferences/Stats ⭐

**Migration:**
```sql
ALTER TABLE human_testers ADD COLUMN preferences JSONB DEFAULT '{}';
ALTER TABLE human_testers ADD COLUMN stats JSONB DEFAULT '{}';
CREATE INDEX idx_testers_preferences ON human_testers USING GIN (preferences);
CREATE INDEX idx_testers_stats ON human_testers USING GIN (stats);
```

**Preferences:**
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

**Stats (computed/cached):**
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

**Benefits:**
- Better tester matching
- Gamification support
- Performance tracking
- Personalized experience

---

## 8. Audit Log/Activity Tracking ⭐⭐

**New Table:**
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_type TEXT CHECK (user_type IN ('company', 'tester', 'admin')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_resource ON activity_log(resource_type, resource_id);
CREATE INDEX idx_activity_log_metadata ON activity_log USING GIN (metadata);
```

**Example Data:**
```json
{
  "action": "test_completed",
  "changes": {"status": "completed", "rating": 5},
  "duration": 1234,
  "issuesFound": 3
}
```

**Benefits:**
- Security auditing
- User behavior analytics
- Debugging ("What did the user do before the error?")
- Compliance (GDPR, SOC2)

---

## Priority Ranking

**Implement Now (Low Risk, High Value):**
1. ⭐⭐⭐ **AI Model Metadata** - Critical for Phase 2/3 tracking
2. ⭐⭐⭐ **Persona Enhancement** - Better AI training data
3. ⭐⭐ **Platform Details** - Better bug tracking

**Implement Soon (Medium Priority):**
4. ⭐⭐ **Test Configuration Metadata** - Better reproducibility
5. ⭐⭐ **Issue Metadata** - Richer bug reports
6. ⭐ **Company Preferences** - Better UX

**Implement Later (Nice to Have):**
7. ⭐ **Tester Preferences/Stats** - Gamification
8. ⭐⭐ **Activity Log** - Auditing/compliance

---

## Recommended Implementation Order

### Week 1 (This Week)
```sql
-- 1. AI Model Metadata (most important for Phase 2/3)
ALTER TABLE test_runs ADD COLUMN ai_metadata JSONB;
CREATE INDEX idx_test_runs_ai_metadata ON test_runs USING GIN (ai_metadata);

-- 2. Platform Details
ALTER TABLE test_runs ADD COLUMN platform_details JSONB;
CREATE INDEX idx_test_runs_platform_details ON test_runs USING GIN (platform_details);
```

### Week 2
```sql
-- 3. Test Configuration
ALTER TABLE test_runs ADD COLUMN test_config JSONB;
CREATE INDEX idx_test_runs_test_config ON test_runs USING GIN (test_config);

-- 4. Issue Metadata
ALTER TABLE issues ADD COLUMN metadata JSONB;
CREATE INDEX idx_issues_metadata ON issues USING GIN (metadata);
```

### Week 3
```sql
-- 5. Company Preferences
ALTER TABLE companies ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_companies_preferences ON companies USING GIN (preferences);

-- 6. Tester Preferences/Stats
ALTER TABLE human_testers ADD COLUMN preferences JSONB DEFAULT '{}';
ALTER TABLE human_testers ADD COLUMN stats JSONB DEFAULT '{}';
```

---

## Migration Bundle (All at Once)

If you want to do them all now (still safe):

```sql
-- test_runs enhancements
ALTER TABLE test_runs ADD COLUMN platform_details JSONB;
ALTER TABLE test_runs ADD COLUMN test_config JSONB;
ALTER TABLE test_runs ADD COLUMN ai_metadata JSONB;

CREATE INDEX idx_test_runs_platform_details ON test_runs USING GIN (platform_details);
CREATE INDEX idx_test_runs_test_config ON test_runs USING GIN (test_config);
CREATE INDEX idx_test_runs_ai_metadata ON test_runs USING GIN (ai_metadata);

-- issues enhancement
ALTER TABLE issues ADD COLUMN metadata JSONB;
CREATE INDEX idx_issues_metadata ON issues USING GIN (metadata);

-- companies enhancement
ALTER TABLE companies ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_companies_preferences ON companies USING GIN (preferences);

-- human_testers enhancements
ALTER TABLE human_testers ADD COLUMN preferences JSONB DEFAULT '{}';
ALTER TABLE human_testers ADD COLUMN stats JSONB DEFAULT '{}';
CREATE INDEX idx_testers_preferences ON human_testers USING GIN (preferences);
CREATE INDEX idx_testers_stats ON human_testers USING GIN (stats);
```

**Total time to run:** ~5 seconds
**Risk:** Zero (all nullable columns)
**Breaking changes:** None

---

## Why This Approach Works

1. **Non-breaking** - All columns are nullable
2. **Gradual adoption** - Use new columns as you build features
3. **Future-proof** - No schema changes needed for new features
4. **Performant** - GIN indexes make JSONB queries fast
5. **Flexible** - Store any structure you need

---

## Next Steps

1. Review this list
2. Pick which enhancements you want
3. I'll create a single migration file with all of them
4. Apply migration (5 seconds)
5. Start using new columns as you build features

**Want me to create the migration file now?**
