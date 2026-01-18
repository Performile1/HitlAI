-- Seed AI Training Data
-- Create synthetic training data to pre-train AI personas before launch

-- This script creates simulated human test results to train AI personas
-- Use this for demo/testing or to give AI personas initial training

-- ============================================================================
-- STEP 1: Create Test Requests (Simulated Company Tests)
-- ============================================================================

-- Get the demo company ID
DO $$
DECLARE
  demo_company_id UUID;
  demo_tester_id UUID;
  persona_tech_savvy UUID;
  persona_senior UUID;
  persona_gen_z UUID;
  test_request_1 UUID;
  test_request_2 UUID;
  test_request_3 UUID;
BEGIN
  -- Get demo company
  SELECT id INTO demo_company_id FROM companies WHERE slug = 'demo-tech-inc' LIMIT 1;
  
  -- Get demo tester
  SELECT id INTO demo_tester_id FROM human_testers WHERE email = 'tester@demo.com' LIMIT 1;
  
  -- Get persona IDs
  SELECT id INTO persona_tech_savvy FROM personas WHERE name = 'Tech-Savvy Millennial' LIMIT 1;
  SELECT id INTO persona_senior FROM personas WHERE name = 'Senior User' LIMIT 1;
  SELECT id INTO persona_gen_z FROM personas WHERE name = 'Mobile-First Gen Z' LIMIT 1;

  -- Create test request 1: E-commerce checkout flow
  INSERT INTO test_requests (
    id,
    company_id,
    title,
    description,
    url,
    mission,
    test_type,
    personas,
    status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    demo_company_id,
    'E-commerce Checkout Flow Test',
    'Test the checkout flow for usability issues',
    'https://example-ecommerce.com',
    'Complete a purchase from cart to confirmation',
    'hybrid',
    jsonb_build_array(persona_tech_savvy, persona_gen_z),
    'completed',
    NOW() - INTERVAL '30 days'
  ) RETURNING id INTO test_request_1;

  -- Create test request 2: Mobile app onboarding
  INSERT INTO test_requests (
    id,
    company_id,
    title,
    description,
    url,
    mission,
    test_type,
    personas,
    status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    demo_company_id,
    'Mobile App Onboarding Test',
    'Test mobile onboarding experience',
    'https://example-mobile-app.com',
    'Complete the onboarding flow as a new user',
    'hybrid',
    jsonb_build_array(persona_gen_z, persona_tech_savvy),
    'completed',
    NOW() - INTERVAL '20 days'
  ) RETURNING id INTO test_request_2;

  -- Create test request 3: Dashboard navigation
  INSERT INTO test_requests (
    id,
    company_id,
    title,
    description,
    url,
    mission,
    test_type,
    personas,
    status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    demo_company_id,
    'Dashboard Navigation Test',
    'Test dashboard navigation for seniors',
    'https://example-dashboard.com',
    'Navigate through the main dashboard features',
    'hybrid',
    jsonb_build_array(persona_senior),
    'completed',
    NOW() - INTERVAL '10 days'
  ) RETURNING id INTO test_request_3;

  -- ============================================================================
  -- STEP 2: Create Training Test Runs (Simulated Human Tests)
  -- ============================================================================

  -- Training tests for Tech-Savvy Millennial (15 tests)
  FOR i IN 1..15 LOOP
    INSERT INTO test_runs (
      id,
      test_request_id,
      tester_id,
      tester_type,
      persona_id,
      platform,
      status,
      friction_points,
      sentiment_score,
      recommendations,
      completed_at,
      created_at
    ) VALUES (
      gen_random_uuid(),
      CASE WHEN i <= 5 THEN test_request_1 WHEN i <= 10 THEN test_request_2 ELSE test_request_3 END,
      demo_tester_id,
      'human',
      persona_tech_savvy,
      'web',
      'completed',
      jsonb_build_array(
        jsonb_build_object('location', 'checkout button', 'severity', 'medium', 'description', 'Button too small on mobile'),
        jsonb_build_object('location', 'payment form', 'severity', 'low', 'description', 'Form validation unclear')
      ),
      0.75 + (random() * 0.2),
      jsonb_build_array('Improve mobile button sizes', 'Add clearer form validation'),
      NOW() - INTERVAL '1 day' * i,
      NOW() - INTERVAL '1 day' * i
    );
  END LOOP;

  -- Training tests for Senior User (12 tests)
  FOR i IN 1..12 LOOP
    INSERT INTO test_runs (
      id,
      test_request_id,
      tester_id,
      tester_type,
      persona_id,
      platform,
      status,
      friction_points,
      sentiment_score,
      recommendations,
      completed_at,
      created_at
    ) VALUES (
      gen_random_uuid(),
      CASE WHEN i <= 4 THEN test_request_1 WHEN i <= 8 THEN test_request_2 ELSE test_request_3 END,
      demo_tester_id,
      'human',
      persona_senior,
      'web',
      'completed',
      jsonb_build_array(
        jsonb_build_object('location', 'navigation menu', 'severity', 'high', 'description', 'Text too small to read'),
        jsonb_build_object('location', 'instructions', 'severity', 'high', 'description', 'Instructions not clear enough')
      ),
      0.55 + (random() * 0.2),
      jsonb_build_array('Increase font sizes', 'Add step-by-step guidance', 'Simplify navigation'),
      NOW() - INTERVAL '1 day' * i,
      NOW() - INTERVAL '1 day' * i
    );
  END LOOP;

  -- Training tests for Gen Z (10 tests)
  FOR i IN 1..10 LOOP
    INSERT INTO test_runs (
      id,
      test_request_id,
      tester_id,
      tester_type,
      persona_id,
      platform,
      status,
      friction_points,
      sentiment_score,
      recommendations,
      completed_at,
      created_at
    ) VALUES (
      gen_random_uuid(),
      CASE WHEN i <= 3 THEN test_request_1 WHEN i <= 7 THEN test_request_2 ELSE test_request_3 END,
      demo_tester_id,
      'human',
      persona_gen_z,
      'mobile',
      'completed',
      jsonb_build_array(
        jsonb_build_object('location', 'loading time', 'severity', 'high', 'description', 'Page loads too slowly'),
        jsonb_build_object('location', 'animations', 'severity', 'low', 'description', 'Animations feel outdated')
      ),
      0.80 + (random() * 0.15),
      jsonb_build_array('Optimize page load speed', 'Add modern animations', 'Improve mobile gestures'),
      NOW() - INTERVAL '1 day' * i,
      NOW() - INTERVAL '1 day' * i
    );
  END LOOP;

  -- ============================================================================
  -- STEP 3: Create Training Contributions
  -- ============================================================================

  -- Record training contributions for each persona
  INSERT INTO ai_training_contributions (
    persona_id,
    tester_id,
    test_run_id,
    contribution_weight,
    created_at
  )
  SELECT 
    tr.persona_id,
    tr.tester_id,
    tr.id,
    1.0 / COUNT(*) OVER (PARTITION BY tr.persona_id),
    tr.created_at
  FROM test_runs tr
  WHERE tr.tester_type = 'human' 
    AND tr.persona_id IS NOT NULL
    AND tr.status = 'completed';

  RAISE NOTICE 'Training data seeded successfully!';
  RAISE NOTICE 'Tech-Savvy Millennial: 15 training tests';
  RAISE NOTICE 'Senior User: 12 training tests';
  RAISE NOTICE 'Mobile-First Gen Z: 10 training tests';
  
END $$;

-- ============================================================================
-- VERIFY TRAINING DATA
-- ============================================================================

SELECT 
  'TRAINING SUMMARY' as check_type,
  p.name as persona_name,
  COUNT(atc.id) as training_tests,
  COUNT(DISTINCT atc.tester_id) as unique_trainers,
  ROUND(AVG(tr.sentiment_score)::numeric, 2) as avg_sentiment
FROM personas p
LEFT JOIN ai_training_contributions atc ON p.id = atc.persona_id
LEFT JOIN test_runs tr ON atc.test_run_id = tr.id
WHERE p.name IN ('Tech-Savvy Millennial', 'Senior User', 'Mobile-First Gen Z')
GROUP BY p.id, p.name
ORDER BY training_tests DESC;

-- ============================================================================
-- NOTES
-- ============================================================================

/*

This script creates synthetic training data for 3 AI personas:
- Tech-Savvy Millennial: 15 tests
- Senior User: 12 tests  
- Mobile-First Gen Z: 10 tests

WHAT THIS DOES:
✓ Creates realistic test requests
✓ Generates human test runs with friction points
✓ Records training contributions
✓ Calculates contribution weights
✓ Ready for AI to learn from

NEXT STEPS:
1. Run this script in Supabase SQL Editor
2. AI personas now have training data
3. They can run tests with improved accuracy
4. Revenue sharing system is ready (though no real revenue yet)

ALTERNATIVE APPROACHES:
- Import real test data from CSV
- Use GPT-4 to generate more diverse scenarios
- Have beta testers complete real tests
- Gradually build training data over time

*/
