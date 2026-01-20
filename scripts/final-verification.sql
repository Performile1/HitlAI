-- Final verification of all critical tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'milestone_progress',
    'unlocked_features',
    'early_adopter_applications',
    'api_endpoint_configs',
    'api_health_metrics',
    'human_corrections',
    'ai_alignment_metrics'
  )
ORDER BY table_name;
