-- Check if milestone tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('milestone_progress', 'unlocked_features', 'platform_milestones')
ORDER BY table_name;

-- Check if the trigger function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_milestone_progress';

-- Check if the trigger exists on test_runs
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'test_runs'
  AND trigger_name LIKE '%milestone%';
