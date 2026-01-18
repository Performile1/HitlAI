-- Manual Database Snapshot
-- Run this in Supabase SQL Editor to get current database state
-- Created: 2026-01-18

-- =====================================================
-- QUICK SUMMARY
-- =====================================================

SELECT 
  '=== DATABASE SUMMARY ===' as info,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(DISTINCT typname) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public') as total_enums,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions;

-- =====================================================
-- ALL TABLES WITH ROW COUNTS
-- =====================================================

SELECT 
  '=== TABLE INVENTORY ===' as section,
  tablename,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename AND relkind = 'r') as exists_check
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- CHECK FOR NEW MIGRATION TABLES
-- =====================================================

-- AI Alignment Infrastructure (Migration 1)
SELECT 
  '=== AI ALIGNMENT TABLES ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_alignment_metrics') as ai_alignment_metrics,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'human_corrections') as human_corrections,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'constitutional_rules') as constitutional_rules,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'constitutional_violations') as constitutional_violations,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'red_team_tests') as red_team_tests,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'red_team_vulnerabilities') as red_team_vulnerabilities,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_inference_logs') as ai_inference_logs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quality_gate_checks') as quality_gate_checks,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'bias_detection_results') as bias_detection_results,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agi_capability_milestones') as agi_capability_milestones,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agi_safety_decisions') as agi_safety_decisions;

-- Monitoring & Security (Migration 2)
SELECT 
  '=== MONITORING TABLES ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') as performance_metrics,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_executions') as agent_executions,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_rate_limits') as api_rate_limits,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'velocity_analysis') as velocity_analysis,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'circuit_breaker_events') as circuit_breaker_events,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_call_logs') as api_call_logs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'security_incidents') as security_incidents,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'system_health_checks') as system_health_checks;

-- Session Recording (Migration 3)
SELECT 
  '=== SESSION RECORDING TABLES ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'page_performance') as page_performance,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'scroll_events') as scroll_events,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'click_events') as click_events,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'form_interactions') as form_interactions,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'rage_click_incidents') as rage_click_incidents,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mouse_movements') as mouse_movements,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'keyboard_events') as keyboard_events,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'visibility_changes') as visibility_changes,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'network_requests') as network_requests,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'console_logs') as console_logs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'javascript_errors') as javascript_errors,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'element_visibility') as element_visibility;

-- API Health Monitoring (Migration 4)
SELECT 
  '=== API HEALTH TABLES ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_health_metrics') as api_health_metrics,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_incidents') as api_incidents,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_endpoint_configs') as api_endpoint_configs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_status_subscriptions') as api_status_subscriptions,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_incident_updates') as api_incident_updates,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_uptime_summary') as api_uptime_summary,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_maintenance_windows') as api_maintenance_windows,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_alert_rules') as api_alert_rules,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_alert_history') as api_alert_history;

-- AI Tester Categorization (Migration 5)
SELECT 
  '=== AI TESTER TABLES ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tester_performance') as ai_tester_performance,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_vs_human_comparison') as ai_vs_human_comparison,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tester_pricing') as ai_tester_pricing,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_model_capabilities') as ai_model_capabilities,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_capability_benchmarks') as ai_capability_benchmarks,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tester_assignment_preferences') as ai_tester_assignment_preferences;

-- =====================================================
-- CHECK CORE DEPENDENCIES
-- =====================================================

SELECT 
  '=== CORE TABLES (DEPENDENCIES) ===' as section,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') as companies,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'test_runs') as test_runs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'test_requests') as test_requests,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') as personas,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') as user_sessions,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'human_testers') as human_testers,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_milestones') as platform_milestones;

-- =====================================================
-- ENUM TYPES
-- =====================================================

SELECT 
  '=== ENUM TYPES ===' as section,
  typname as enum_name,
  array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY typname
ORDER BY typname;

-- =====================================================
-- MIGRATION STATUS SUMMARY
-- =====================================================

SELECT 
  '=== MIGRATION STATUS ===' as section,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_alignment_metrics') 
    THEN '✓ Applied' 
    ELSE '✗ Pending' 
  END as migration_1_ai_alignment,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') 
    THEN '✓ Applied' 
    ELSE '✗ Pending' 
  END as migration_2_monitoring,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'page_performance') 
    THEN '✓ Applied' 
    ELSE '✗ Pending' 
  END as migration_3_session_recording,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_health_metrics') 
    THEN '✓ Applied' 
    ELSE '✗ Pending' 
  END as migration_4_api_health,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tester_performance') 
    THEN '✓ Applied' 
    ELSE '✗ Pending' 
  END as migration_5_ai_categorization;

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM (VALUES 
    ('ai_alignment_metrics'),
    ('performance_metrics'),
    ('page_performance'),
    ('api_health_metrics'),
    ('ai_tester_performance')
  ) AS t(table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE information_schema.tables.table_name = t.table_name
  );
  
  IF missing_count = 5 THEN
    RAISE NOTICE '📋 STATUS: All 5 new migrations need to be applied';
    RAISE NOTICE '📝 ACTION: Run migrations in order 1→5 from MIGRATION_EXECUTION_PLAN.md';
  ELSIF missing_count > 0 THEN
    RAISE NOTICE '⚠️  STATUS: % of 5 migrations are pending', missing_count;
    RAISE NOTICE '📝 ACTION: Review which migrations are missing and apply them';
  ELSE
    RAISE NOTICE '✅ STATUS: All migrations have been applied!';
    RAISE NOTICE '🎉 ACTION: Database is up to date';
  END IF;
END $$;
