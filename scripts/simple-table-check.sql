-- Simple Table Existence Check
-- Just lists what tables exist, no errors

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    -- New feature tables we need to verify
    'milestone_progress',
    'unlocked_features',
    'early_adopter_applications',
    'api_endpoint_configs',
    'api_health_metrics',
    'api_incidents',
    'human_corrections',
    'ai_alignment_metrics',
    'test_runs',
    'companies'
  )
ORDER BY table_name;

-- Count total public tables
SELECT COUNT(*) as total_public_tables
FROM information_schema.tables
WHERE table_schema = 'public';
