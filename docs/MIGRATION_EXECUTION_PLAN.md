# Migration Execution Plan

## Current Status
This document tracks which migrations need to be run and in what order.

---

## ✅ Migrations Already Applied (Assumed)
Based on the existing schema, these migrations should already be in your database:

### Phase 1: Core Infrastructure (Jan 8-9)
1. ✅ `20260108_initial_schema.sql` - Core tables (companies, test_runs, personas, etc.)
2. ✅ `20260108_add_guideline_citations.sql`
3. ✅ `20260109_platform_infrastructure.sql`
4. ✅ `20260109_enhanced_persona_recording.sql`
5. ✅ `20260109_human_behavior_learning.sql`
6. ✅ `20260109_enhanced_interaction_tracking.sql`
7. ✅ `20260109_enhanced_test_requests.sql`
8. ✅ `20260109_monitoring_tables.sql`
9. ✅ `20260109_archival_strategy.sql`
10. ✅ `20260109_enhanced_security_rls.sql`

### Phase 2: Advanced Features (Jan 11-13)
11. ✅ `20260111_gemini_enhancements.sql`
12. ✅ `20260111_confidence_guarantee.sql`
13. ✅ `20260111_enhanced_disputes.sql`
14. ✅ `20260111_rpc_functions.sql`
15. ✅ `20260112_admin_controls.sql`
16. ✅ `20260113_ai_training_incentives.sql`
17. ✅ `20260113_tester_ratings_enhancements.sql`
18. ✅ `20260113_rating_monitoring_system.sql`
19. ✅ `20260113_add_total_earnings.sql`
20. ✅ `20260113_blog_system.sql`
21. ✅ `20260113_demo_accounts.sql`
22. ✅ `20260113_demo_accounts_v2.sql`
23. ✅ `20260113_initialize_platform_settings.sql`

### Phase 3: Testing & Accounts (Jan 14)
24. ✅ `20260114000000_create_demo_accounts.sql`
25. ✅ `20260114000001_add_test_fixtures_fields.sql`
26. ✅ `20260114000002_add_admin_account.sql`
27. ✅ `20260114000003_test_assignments_and_notifications.sql`
28. ✅ `20260114000004_fix_human_testers_rls.sql`
29. ✅ `20260114000005_fix_company_members_rls.sql`

### Phase 4: Progressive Unlock (Jan 16)
30. ✅ `20260116000001_milestone_tracking.sql`
31. ✅ `20260116000002_training_data_collection.sql`
32. ✅ `20260116000003_early_adopter_programs.sql`
33. ✅ `20260116000004_create_issues_table.sql`
34. ✅ `20260116000005_jsonb_enhancements.sql`

---

## 🔄 NEW MIGRATIONS TO RUN (Jan 17)

### Phase 5: AI Alignment & Advanced Monitoring
**Status:** Ready to deploy - All errors fixed ✅

Run these migrations **in order**:

### 1️⃣ `20260117000001_ai_alignment_infrastructure.sql`
**Purpose:** RLHF, Constitutional AI, Red Teaming, AGI Governance

**Creates 11 tables:**
- `ai_alignment_metrics` - Track model alignment scores
- `human_corrections` - RLHF feedback data
- `constitutional_rules` - Dynamic rule hierarchy
- `constitutional_violations` - Rule violation tracking
- `red_team_tests` - Adversarial test definitions
- `red_team_vulnerabilities` - Discovered vulnerabilities
- `ai_inference_logs` - Complete AI decision logging
- `quality_gate_checks` - Hallucination & laziness detection
- `bias_detection_results` - Bias analysis results
- `agi_capability_milestones` - AGI progress tracking
- `agi_safety_decisions` - Critical safety decisions log

**Dependencies:** Requires `test_runs`, `personas` tables

---

### 2️⃣ `20260117000002_monitoring_security_tables.sql`
**Purpose:** Performance monitoring, rate limiting, security

**Creates 8 tables:**
- `performance_metrics` - System performance tracking
- `agent_executions` - AI agent execution logs
- `api_rate_limits` - Rate limiting tracking
- `velocity_analysis` - User behavior velocity
- `circuit_breaker_events` - Circuit breaker state changes
- `api_call_logs` - External API call logs
- `security_incidents` - Security event tracking
- `system_health_checks` - Service health monitoring

**Dependencies:** None (standalone)

---

### 3️⃣ `20260117000003_session_recording_tables.sql`
**Purpose:** Detailed user interaction tracking

**Creates 12 tables:**
- `page_performance` - Core Web Vitals & page metrics
- `scroll_events` - Scroll behavior tracking
- `click_events` - Click interaction tracking
- `form_interactions` - Form field interactions
- `rage_click_incidents` - Frustration detection
- `mouse_movements` - Mouse movement patterns
- `keyboard_events` - Keyboard interaction tracking
- `visibility_changes` - Tab visibility changes
- `network_requests` - Network request monitoring
- `console_logs` - Browser console logs
- `javascript_errors` - JS error tracking
- `element_visibility` - Element visibility tracking

**Dependencies:** Requires `user_sessions`, `test_runs` tables

---

### 4️⃣ `20260117000004_api_health_monitoring.sql`
**Purpose:** API uptime, incidents, status page

**Creates 9 tables:**
- `api_health_metrics` - Endpoint health metrics
- `api_incidents` - Incident tracking
- `api_endpoint_configs` - Endpoint configurations
- `api_status_subscriptions` - Status page subscriptions
- `api_incident_updates` - Incident update timeline
- `api_uptime_summary` - Daily/weekly uptime stats
- `api_maintenance_windows` - Scheduled maintenance
- `api_alert_rules` - Alert configuration
- `api_alert_history` - Alert notification history

**Dependencies:** None (standalone)

---

### 5️⃣ `20260117000005_ai_tester_categorization.sql`
**Purpose:** AI vs Human tester categorization & pricing

**Creates 2 enums + 6 tables:**

**Enums:**
- `tester_category_enum` - (novice_ai, intermediate_ai, expert_ai, human)
- `ai_capability_level_enum` - (basic, intermediate, advanced, expert, agi)

**Tables:**
- `ai_tester_performance` - AI tester performance metrics
- `ai_vs_human_comparison` - AI vs Human test comparisons
- `ai_tester_pricing` - Dynamic pricing by category
- `ai_model_capabilities` - Model capability tracking
- `ai_capability_benchmarks` - Benchmark results
- `ai_tester_assignment_preferences` - Company preferences

**Dependencies:** Requires `test_runs`, `personas` tables

---

## 📊 Summary

### Total New Infrastructure
- **5 new migrations**
- **46 new tables**
- **2 new enums**
- **All foreign key issues fixed** ✅
- **All constraint violations fixed** ✅

### Execution Order
```bash
# Run in Supabase SQL Editor in this exact order:
1. 20260117000001_ai_alignment_infrastructure.sql
2. 20260117000002_monitoring_security_tables.sql
3. 20260117000003_session_recording_tables.sql
4. 20260117000004_api_health_monitoring.sql
5. 20260117000005_ai_tester_categorization.sql
```

### Pre-Deployment Checklist
- ✅ All migrations use `CREATE TABLE IF NOT EXISTS`
- ✅ No foreign key references to non-existent `users` table
- ✅ All `user_id` columns are nullable UUIDs with comments
- ✅ Session recording uses `user_session_id UUID` (not `session_id TEXT`)
- ✅ Seed file includes `platform` column
- ✅ All migrations are idempotent (safe to re-run)

### Post-Deployment Verification
After running migrations, verify with:
```sql
-- Check all new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'ai_alignment_metrics',
    'human_corrections',
    'constitutional_rules',
    'performance_metrics',
    'page_performance',
    'api_health_metrics',
    'ai_tester_performance'
  )
ORDER BY table_name;

-- Check row counts (should be 0 initially)
SELECT 
  'ai_alignment_metrics' as table_name, COUNT(*) as rows FROM ai_alignment_metrics
UNION ALL
SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
UNION ALL
SELECT 'page_performance', COUNT(*) FROM page_performance
UNION ALL
SELECT 'api_health_metrics', COUNT(*) FROM api_health_metrics;
```

---

## 🚀 Deployment Steps

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each migration file content
3. Run them in order (1 → 5)
4. Verify no errors in output
5. Run verification queries above

### Option 2: Supabase CLI
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or run individually
supabase db execute -f supabase/migrations/20260117000001_ai_alignment_infrastructure.sql
supabase db execute -f supabase/migrations/20260117000002_monitoring_security_tables.sql
supabase db execute -f supabase/migrations/20260117000003_session_recording_tables.sql
supabase db execute -f supabase/migrations/20260117000004_api_health_monitoring.sql
supabase db execute -f supabase/migrations/20260117000005_ai_tester_categorization.sql
```

### Option 3: Git Push (Auto-deploy)
If you have Supabase GitHub integration:
```bash
git add supabase/migrations/20260117*.sql
git commit -m "Add AI alignment and monitoring infrastructure"
git push origin main
```

---

## 📝 Notes

### Safe to Run Multiple Times
All migrations use `CREATE TABLE IF NOT EXISTS`, so they're safe to re-run without causing errors.

### No Data Loss
These migrations only CREATE new tables. They don't ALTER or DROP existing tables.

### Dependencies Met
All required tables (`test_runs`, `personas`, `user_sessions`) already exist from previous migrations.

### Testing Recommendation
Consider running on a staging/preview environment first if available.

---

**Last Updated:** 2026-01-18  
**Status:** Ready for deployment ✅
