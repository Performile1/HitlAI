-- Seed test data to test milestone tracking
-- This creates mock completed tests to verify the progressive unlock system

-- Insert mock completed tests
INSERT INTO test_runs (
  id,
  company_id,
  url,
  mission,
  persona,
  platform,
  test_type,
  status,
  company_ai_rating,
  completed_at,
  created_at,
  updated_at
) VALUES 
-- Test 1: High quality
(
  gen_random_uuid(),
  (SELECT id FROM companies LIMIT 1),
  'https://example.com',
  'Test the checkout flow',
  '{"name": "Tech-Savvy User", "age": 30, "occupation": "Software Engineer"}',
  'web',
  'ai_only',
  'completed',
  5,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
),
-- Test 2: High quality
(
  gen_random_uuid(),
  (SELECT id FROM companies LIMIT 1),
  'https://example.com/signup',
  'Test the signup process',
  '{"name": "Marketing Manager", "age": 35, "occupation": "Marketing"}',
  'mobile',
  'ai_only',
  'completed',
  4,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours'
),
-- Test 3: Medium quality
(
  gen_random_uuid(),
  (SELECT id FROM companies LIMIT 1),
  'https://example.com/pricing',
  'Test the pricing page',
  '{"name": "Budget-Conscious User", "age": 28}',
  'web',
  'ai_only',
  'completed',
  3,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '5 hours'
),
-- Test 4: High quality
(
  gen_random_uuid(),
  (SELECT id FROM companies LIMIT 1),
  'https://example.com/dashboard',
  'Test the dashboard UX',
  '{"name": "Power User", "age": 40, "occupation": "Product Manager"}',
  'web',
  'ai_only',
  'completed',
  5,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes'
);

-- Update milestone progress
SELECT update_milestone_progress();

-- Show results
SELECT 
  milestone_name,
  current_value,
  target_value,
  ROUND((current_value::DECIMAL / NULLIF(target_value, 0)) * 100, 1) as progress_pct,
  is_unlocked,
  unlock_phase
FROM platform_milestones
WHERE unlock_phase = 'phase2'
ORDER BY target_value;

-- Show test count
SELECT 
  COUNT(*) as total_tests,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tests,
  COUNT(*) FILTER (WHERE status = 'completed' AND company_ai_rating >= 4) as high_quality_tests
FROM test_runs;
