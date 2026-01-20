-- Simple Database Table Check
-- Lists all tables that currently exist in the public schema

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check for milestone tracking tables specifically
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'milestone_progress') 
    THEN '✅ milestone_progress EXISTS'
    ELSE '❌ milestone_progress MISSING - Run migration 20260116000001_milestone_tracking.sql'
  END as milestone_progress_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unlocked_features') 
    THEN '✅ unlocked_features EXISTS'
    ELSE '❌ unlocked_features MISSING - Run migration 20260116000001_milestone_tracking.sql'
  END as unlocked_features_status;

-- Check for early adopter table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'early_adopter_applications') 
    THEN '✅ early_adopter_applications EXISTS'
    ELSE '❌ early_adopter_applications MISSING - Run migration 20260119000001_early_adopter_applications.sql'
  END as early_adopter_status;

-- Check for API health monitoring tables
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_endpoint_configs') 
    THEN '✅ api_endpoint_configs EXISTS'
    ELSE '❌ api_endpoint_configs MISSING - Run migration 20260117000004_api_health_monitoring.sql'
  END as api_health_status;

-- Check for AI alignment tables
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_alignment_metrics') 
    THEN '✅ ai_alignment_metrics EXISTS'
    ELSE '❌ ai_alignment_metrics MISSING - Run migration 20260117000001_ai_alignment_infrastructure.sql'
  END as ai_alignment_status;

-- Check for training data collection
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'human_corrections') 
    THEN '✅ human_corrections EXISTS'
    ELSE '❌ human_corrections MISSING - Run migration 20260116000002_training_data_collection.sql'
  END as training_data_status;
