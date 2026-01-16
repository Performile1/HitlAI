-- Check milestone progress
SELECT 
  milestone_name,
  milestone_type,
  current_value,
  target_value,
  ROUND((current_value::DECIMAL / NULLIF(target_value, 0)) * 100, 1) as progress_pct,
  is_unlocked,
  unlock_phase,
  unlocked_at
FROM platform_milestones
ORDER BY unlock_phase, target_value;

-- Check phase unlock status
SELECT * FROM phase_unlock_status;

-- Check current phase
SELECT get_current_phase() as current_phase;

-- Check test_runs count
SELECT 
  COUNT(*) as total_tests,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tests,
  COUNT(*) FILTER (WHERE status = 'completed' AND company_ai_rating >= 4) as high_quality_tests
FROM test_runs;
