# Migration Execution Order - Pre-Flight Setup

## 🚨 Current Issue
The database verification script failed because core tables don't exist yet. You need to run migrations in the correct order.

---

## ✅ Step-by-Step Migration Guide

### **Step 1: Check Current State**
Run this simple check first:
```sql
-- File: scripts/check-existing-tables.sql
-- Copy and paste into Supabase SQL Editor
```

This will tell you which tables are missing and which migrations to run.

---

### **Step 2: Run Missing Migrations (In Order)**

#### **A. Milestone Tracking System** ⭐ PRIORITY
**File:** `supabase/migrations/20260116000001_milestone_tracking.sql`

**Creates:**
- `milestone_progress` table
- `unlocked_features` table
- `update_milestone_progress()` function
- Trigger on `test_runs` table

**Run this first if missing.**

---

#### **B. Training Data Collection**
**File:** `supabase/migrations/20260116000002_training_data_collection.sql`

**Creates:**
- `human_corrections` table
- `ai_training_sessions` table
- Related indexes

**Depends on:** Core tables (test_runs, human_testers)

---

#### **C. AI Alignment Infrastructure**
**File:** `supabase/migrations/20260117000001_ai_alignment_infrastructure.sql`

**Creates 11 tables:**
- `ai_alignment_metrics`
- `constitutional_rules`
- `constitutional_violations`
- `red_team_tests`
- `red_team_vulnerabilities`
- `ai_inference_logs`
- `human_corrections` (if not exists)
- `alignment_training_data`
- `safety_test_results`
- `agi_capability_milestones`
- `agi_risk_assessments`

---

#### **D. Monitoring & Security**
**File:** `supabase/migrations/20260117000002_monitoring_security_tables.sql`

**Creates 8 tables:**
- `performance_metrics`
- `rate_limit_configs`
- `rate_limit_violations`
- `api_call_logs`
- `security_incidents`
- `circuit_breaker_events`
- `agent_execution_logs`
- `system_health_checks`

---

#### **E. Session Recording**
**File:** `supabase/migrations/20260117000003_session_recording_tables.sql`

**Creates 12 tables:**
- `page_performance_metrics`
- `user_interactions`
- `rage_clicks`
- `network_requests`
- `console_logs`
- `javascript_errors`
- `form_analytics`
- `scroll_depth_tracking`
- `element_visibility_tracking`
- `custom_events`
- `session_replays`
- `heatmap_data`

---

#### **F. API Health Monitoring** ⭐ PRIORITY
**File:** `supabase/migrations/20260117000004_api_health_monitoring.sql`

**Creates 9 tables:**
- `api_endpoint_configs`
- `api_health_metrics`
- `api_incidents`
- `api_status_pages`
- `api_status_subscribers`
- `api_uptime_summary`
- `api_alert_rules`
- `api_alert_notifications`
- `api_maintenance_windows`

**Run this for API health dashboard to work.**

---

#### **G. AI Tester Categorization**
**File:** `supabase/migrations/20260117000005_ai_tester_categorization.sql`

**Creates 6 tables + enums:**
- `tester_category` enum
- `test_complexity_level` enum
- `ai_vs_human_comparison`
- `tester_pricing_tiers`
- `ai_model_capabilities`
- `test_complexity_scores`
- `tester_performance_benchmarks`
- `tester_assignment_preferences`

---

#### **H. Early Adopter Applications** ⭐ PRIORITY
**File:** `supabase/migrations/20260119000001_early_adopter_applications.sql`

**Creates:**
- `early_adopter_applications` table with all columns including `priority_score`

**Run this for early access program to work.**

---

#### **I. Early Adopter Fix (Optional)**
**File:** `supabase/migrations/20260119000002_fix_early_adopter_priority_score.sql`

**Purpose:** Adds `priority_score` column if missing (idempotent fix)

**Only run if:** You ran an incomplete version of migration H

---

## 📋 Quick Execution Checklist

### **Minimum Required for Current Features:**
- [x] ✅ `20260116000001_milestone_tracking.sql` - For progressive unlocks
- [x] ✅ `20260117000004_api_health_monitoring.sql` - For API health dashboard
- [x] ✅ `20260116000002_training_data_collection.sql` - For AI training feedback
- [x] ✅ `20260119000001_early_adopter_applications.sql` - For early access program

### **Recommended for Full System:**
- [ ] `20260117000001_ai_alignment_infrastructure.sql` - AI safety metrics
- [ ] `20260117000002_monitoring_security_tables.sql` - Performance monitoring
- [ ] `20260117000003_session_recording_tables.sql` - Session replay
- [ ] `20260117000005_ai_tester_categorization.sql` - AI vs Human comparison

---

## 🔧 How to Run Migrations

### **Option 1: Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire migration file content
4. Paste into editor
5. Click "Run"
6. Verify success message

### **Option 2: Supabase CLI**
```bash
# Run all pending migrations
supabase db push

# Or run specific migration
supabase db push --file supabase/migrations/20260116000001_milestone_tracking.sql
```

---

## ✅ Verification After Running Migrations

### **Quick Check:**
```sql
-- Run: scripts/check-existing-tables.sql
-- Should show all tables with ✅
```

### **Full Verification:**
```sql
-- Run: scripts/verify-database-tables.sql
-- Only after all migrations are complete
```

---

## 🚨 Troubleshooting

### **Error: "relation already exists"**
- **Cause:** Migration already ran
- **Solution:** Skip to next migration

### **Error: "column already exists"**
- **Cause:** Partial migration ran before
- **Solution:** Run the fix migration (20260119000002) or manually check

### **Error: "relation does not exist"**
- **Cause:** Dependency missing (e.g., test_runs table)
- **Solution:** Run core migrations first (20260108_initial_schema.sql)

### **Error: "function does not exist"**
- **Cause:** Missing RPC functions
- **Solution:** Run 20260111_rpc_functions.sql first

---

## 📊 Expected Table Count After All Migrations

- **Core tables:** 5 (test_requests, test_runs, human_testers, companies, user_sessions)
- **Milestone tracking:** 2
- **AI Alignment:** 11
- **Monitoring & Security:** 8
- **Session Recording:** 12
- **API Health:** 9
- **AI Tester Categorization:** 6
- **Early Adopter:** 1

**Total Expected:** 54 tables

---

## 🎯 Next Steps After Migrations

1. ✅ Run `scripts/check-existing-tables.sql` to verify
2. ✅ Run `scripts/verify-database-tables.sql` for full audit
3. ✅ Test API endpoints with Postman/Thunder Client
4. ✅ Test UI components in browser
5. ✅ Deploy to production

---

**Last Updated:** January 19, 2026  
**Status:** Ready for execution
