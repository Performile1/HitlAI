-- Database Verification Script
-- Checks all expected tables exist and have correct structure
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: TABLE EXISTENCE CHECK
-- ============================================

SELECT 
  'TABLE EXISTENCE CHECK' as check_type,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all public tables
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      -- Core tables
      'test_requests', 'test_runs', 'human_testers', 'companies', 'user_sessions',
      -- Milestone tracking
      'milestone_progress', 'unlocked_features',
      -- AI Alignment Infrastructure (11 tables)
      'ai_alignment_metrics', 'constitutional_rules', 'constitutional_violations',
      'red_team_tests', 'red_team_vulnerabilities', 'ai_inference_logs',
      'human_corrections', 'alignment_training_data', 'safety_test_results',
      'agi_capability_milestones', 'agi_risk_assessments',
      -- Monitoring & Security (8 tables)
      'performance_metrics', 'rate_limit_configs', 'rate_limit_violations',
      'api_call_logs', 'security_incidents', 'circuit_breaker_events',
      'agent_execution_logs', 'system_health_checks',
      -- Session Recording (12 tables)
      'page_performance_metrics', 'user_interactions', 'rage_clicks',
      'network_requests', 'console_logs', 'javascript_errors',
      'form_analytics', 'scroll_depth_tracking', 'element_visibility_tracking',
      'custom_events', 'session_replays', 'heatmap_data',
      -- API Health Monitoring (9 tables)
      'api_endpoint_configs', 'api_health_metrics', 'api_incidents',
      'api_status_pages', 'api_status_subscribers', 'api_uptime_summary',
      'api_alert_rules', 'api_alert_notifications', 'api_maintenance_windows',
      -- AI Tester Categorization (6 tables)
      'ai_vs_human_comparison', 'tester_pricing_tiers', 'ai_model_capabilities',
      'test_complexity_scores', 'tester_performance_benchmarks', 'tester_assignment_preferences',
      -- Early Adopter
      'early_adopter_applications'
    ) THEN '✅ Expected'
    ELSE '⚠️ Unexpected'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- PART 2: EXPECTED TABLES VERIFICATION
-- ============================================

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    -- Core tables (5)
    'test_requests', 'test_runs', 'human_testers', 'companies', 'user_sessions',
    -- Milestone tracking (2)
    'milestone_progress', 'unlocked_features',
    -- AI Alignment Infrastructure (11)
    'ai_alignment_metrics', 'constitutional_rules', 'constitutional_violations',
    'red_team_tests', 'red_team_vulnerabilities', 'ai_inference_logs',
    'human_corrections', 'alignment_training_data', 'safety_test_results',
    'agi_capability_milestones', 'agi_risk_assessments',
    -- Monitoring & Security (8)
    'performance_metrics', 'rate_limit_configs', 'rate_limit_violations',
    'api_call_logs', 'security_incidents', 'circuit_breaker_events',
    'agent_execution_logs', 'system_health_checks',
    -- Session Recording (12)
    'page_performance_metrics', 'user_interactions', 'rage_clicks',
    'network_requests', 'console_logs', 'javascript_errors',
    'form_analytics', 'scroll_depth_tracking', 'element_visibility_tracking',
    'custom_events', 'session_replays', 'heatmap_data',
    -- API Health Monitoring (9)
    'api_endpoint_configs', 'api_health_metrics', 'api_incidents',
    'api_status_pages', 'api_status_subscribers', 'api_uptime_summary',
    'api_alert_rules', 'api_alert_notifications', 'api_maintenance_windows',
    -- AI Tester Categorization (6)
    'ai_vs_human_comparison', 'tester_pricing_tiers', 'ai_model_capabilities',
    'test_complexity_scores', 'tester_performance_benchmarks', 'tester_assignment_preferences',
    -- Early Adopter (1)
    'early_adopter_applications'
  ]) as table_name
),
actual_tables AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
)
SELECT 
  e.table_name,
  CASE 
    WHEN a.table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM expected_tables e
LEFT JOIN actual_tables a ON e.table_name = a.table_name
ORDER BY 
  CASE WHEN a.table_name IS NULL THEN 0 ELSE 1 END,
  e.table_name;

-- ============================================
-- PART 3: TABLE COUNTS
-- ============================================

SELECT 'TABLE ROW COUNTS' as check_type;

-- Core tables
SELECT 'test_requests' as table_name, COUNT(*) as row_count FROM test_requests
UNION ALL SELECT 'test_runs', COUNT(*) FROM test_runs
UNION ALL SELECT 'human_testers', COUNT(*) FROM human_testers
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'user_sessions', COUNT(*) FROM user_sessions
-- Milestone tracking
UNION ALL SELECT 'milestone_progress', COUNT(*) FROM milestone_progress
UNION ALL SELECT 'unlocked_features', COUNT(*) FROM unlocked_features
-- AI Alignment
UNION ALL SELECT 'ai_alignment_metrics', COUNT(*) FROM ai_alignment_metrics
UNION ALL SELECT 'constitutional_rules', COUNT(*) FROM constitutional_rules
UNION ALL SELECT 'human_corrections', COUNT(*) FROM human_corrections
-- Monitoring
UNION ALL SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
UNION ALL SELECT 'api_call_logs', COUNT(*) FROM api_call_logs
-- Session Recording
UNION ALL SELECT 'page_performance_metrics', COUNT(*) FROM page_performance_metrics
UNION ALL SELECT 'user_interactions', COUNT(*) FROM user_interactions
-- API Health
UNION ALL SELECT 'api_endpoint_configs', COUNT(*) FROM api_endpoint_configs
UNION ALL SELECT 'api_health_metrics', COUNT(*) FROM api_health_metrics
-- Early Adopter
UNION ALL SELECT 'early_adopter_applications', COUNT(*) FROM early_adopter_applications
ORDER BY table_name;

-- ============================================
-- PART 4: ENUM TYPES CHECK
-- ============================================

SELECT 'ENUM TYPES CHECK' as check_type;

SELECT 
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('tester_category', 'test_complexity_level')
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================
-- PART 5: CRITICAL COLUMNS CHECK
-- ============================================

SELECT 'CRITICAL COLUMNS CHECK' as check_type;

-- Check early_adopter_applications has priority_score
SELECT 
  'early_adopter_applications.priority_score' as column_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'early_adopter_applications' 
      AND column_name = 'priority_score'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check milestone_progress has company_id
SELECT 
  'milestone_progress.company_id' as column_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'milestone_progress' 
      AND column_name = 'company_id'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- ============================================
-- PART 6: INDEX CHECK
-- ============================================

SELECT 'INDEX CHECK' as check_type;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'early_adopter_applications',
    'milestone_progress',
    'unlocked_features',
    'api_health_metrics',
    'human_corrections'
  )
ORDER BY tablename, indexname;

-- ============================================
-- PART 7: TRIGGER CHECK
-- ============================================

SELECT 'TRIGGER CHECK' as check_type;

SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'milestone_progress',
    'early_adopter_applications',
    'test_runs'
  )
ORDER BY event_object_table, trigger_name;

-- ============================================
-- PART 8: MIGRATION STATUS
-- ============================================

SELECT 'MIGRATION STATUS' as check_type;

SELECT 
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;

-- ============================================
-- SUMMARY
-- ============================================

SELECT 'VERIFICATION SUMMARY' as check_type;

SELECT 
  'Total Tables' as metric,
  COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Expected Tables',
  '54'
UNION ALL
SELECT 
  'Total Indexes',
  COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total Triggers',
  COUNT(*)::text
FROM information_schema.triggers
WHERE trigger_schema = 'public';
