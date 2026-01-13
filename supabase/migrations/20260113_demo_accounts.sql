-- Demo Accounts Migration
-- Creates fully functional demo accounts for Admin, Company, and Human Tester
-- All passwords are: Demo123!

-- Note: In production Supabase, you'll need to create these users through the Supabase dashboard
-- or Auth API. This migration creates the profile data that links to those auth users.

-- ============================================================================
-- DEMO ADMIN USER
-- ============================================================================
-- Email: admin@hitlai.com
-- Password: Demo123!
-- User Type: admin
-- This user has access to all admin pages: /admin/digital-twins, /admin/settings, /admin/forge, /admin/disputes

-- Create admin user metadata (auth user must be created via Supabase dashboard)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, user_metadata)
-- VALUES (
--   'admin@hitlai.com',
--   crypt('Demo123!', gen_salt('bf')),
--   NOW(),
--   '{"user_type": "admin", "full_name": "Admin User"}'::jsonb
-- );


-- ============================================================================
-- DEMO COMPANY USER
-- ============================================================================
-- Email: demo@company.com
-- Password: Demo123!
-- User Type: company
-- Company Name: Demo Tech Inc.

-- Create company profile
INSERT INTO companies (
  id,
  name,
  email,
  industry,
  company_size,
  website,
  plan_type,
  monthly_test_quota,
  tests_used_this_month,
  credits_balance,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'Demo Tech Inc.',
  'demo@company.com',
  'technology',
  '50-200',
  'https://demotech.example.com',
  'pro',
  100,
  15,
  250,
  true,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  monthly_test_quota = EXCLUDED.monthly_test_quota,
  credits_balance = EXCLUDED.credits_balance;


-- ============================================================================
-- DEMO HUMAN TESTER USER
-- ============================================================================
-- Email: tester@demo.com
-- Password: Demo123!
-- User Type: tester
-- Display Name: Sarah Johnson

-- Create human tester profile
INSERT INTO human_testers (
  id,
  user_id,
  email,
  display_name,
  
  -- Demographics
  age,
  gender,
  occupation,
  education_level,
  location_country,
  
  -- Experience
  tech_literacy,
  primary_device,
  languages,
  years_of_testing_experience,
  previous_platforms,
  
  -- Preferences
  preferred_test_types,
  preferred_industries,
  min_test_duration_minutes,
  max_test_duration_minutes,
  max_tests_per_week,
  
  -- Payment & Status
  payment_method,
  timezone,
  is_available,
  is_verified,
  
  -- Performance (simulated history)
  total_tests_completed,
  average_rating,
  avg_communication_rating,
  avg_quality_rating,
  avg_timeliness_rating,
  total_ratings,
  would_work_again_percent,
  tier,
  platform_fee_percent,
  total_earnings_usd,
  
  created_at
) VALUES (
  gen_random_uuid(),
  NULL, -- Will be linked when auth user is created
  'tester@demo.com',
  'Sarah Johnson',
  
  -- Demographics
  28,
  'female',
  'UX Designer',
  'bachelors',
  'United States',
  
  -- Experience
  'high',
  'desktop',
  ARRAY['en', 'es'],
  3,
  ARRAY['usertesting', 'userlytics'],
  
  -- Preferences
  ARRAY['usability', 'accessibility', 'ecommerce'],
  ARRAY['fintech', 'healthcare', 'education'],
  15,
  60,
  15,
  
  -- Payment & Status
  'stripe',
  'America/New_York',
  true,
  true,
  
  -- Performance (simulated history)
  127,
  4.7,
  4.8,
  4.7,
  4.6,
  89,
  92.5,
  'expert',
  20,
  1778.00,
  
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  total_tests_completed = EXCLUDED.total_tests_completed,
  average_rating = EXCLUDED.average_rating,
  tier = EXCLUDED.tier;


-- ============================================================================
-- DEMO TEST HISTORY FOR TESTER
-- ============================================================================
-- Create some test history entries for the demo tester

DO $$
DECLARE
  demo_tester_id UUID;
  demo_company_id UUID;
  test_categories TEXT[] := ARRAY['usability', 'accessibility', 'ecommerce', 'functional', 'saas'];
  i INT;
BEGIN
  -- Get demo tester ID
  SELECT id INTO demo_tester_id FROM human_testers WHERE email = 'tester@demo.com';
  SELECT id INTO demo_company_id FROM companies WHERE email = 'demo@company.com';
  
  IF demo_tester_id IS NOT NULL AND demo_company_id IS NOT NULL THEN
    -- Create 10 recent test history entries
    FOR i IN 1..10 LOOP
      INSERT INTO tester_test_history (
        tester_id,
        company_id,
        test_category,
        completed_at,
        completion_time_minutes,
        company_rating,
        amount_earned_usd
      ) VALUES (
        demo_tester_id,
        demo_company_id,
        test_categories[(i % 5) + 1],
        NOW() - (i || ' days')::INTERVAL,
        15 + (i * 3),
        4.0 + (random() * 1.0),
        14.00 + (random() * 6.00)
      );
    END LOOP;
  END IF;
END $$;


-- ============================================================================
-- DEMO PERSONAS FOR TESTING
-- ============================================================================
-- Create some demo AI personas

INSERT INTO personas (
  name,
  age,
  tech_literacy,
  eyesight,
  attention_rules,
  cognitive_load,
  preferred_navigation,
  reading_level,
  is_default,
  is_public,
  created_at
) VALUES
  (
    'Tech-Savvy Millennial',
    32,
    'high',
    'perfect',
    '["Easily distracted by notifications", "Prefers quick scanning over detailed reading"]'::jsonb,
    'low',
    'keyboard',
    'college',
    true,
    true,
    NOW()
  ),
  (
    'Senior User',
    68,
    'low',
    'needs_glasses',
    '["Needs clear instructions", "Prefers step-by-step guidance"]'::jsonb,
    'high',
    'mouse',
    'high_school',
    true,
    true,
    NOW()
  ),
  (
    'Mobile-First Gen Z',
    22,
    'high',
    'perfect',
    '["Expects instant feedback", "Comfortable with gestures"]'::jsonb,
    'low',
    'touch',
    'college',
    true,
    true,
    NOW()
  )
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- DEMO TEST REQUEST
-- ============================================================================
-- Create a sample test request from the demo company

DO $$
DECLARE
  demo_company_id UUID;
  test_request_id UUID;
BEGIN
  SELECT id INTO demo_company_id FROM companies WHERE email = 'demo@company.com';
  
  IF demo_company_id IS NOT NULL THEN
    INSERT INTO test_requests (
      company_id,
      title,
      description,
      target_url,
      test_type,
      status,
      total_tests_requested,
      ai_tests_requested,
      human_tests_requested,
      total_cost,
      created_at
    ) VALUES (
      demo_company_id,
      'E-commerce Checkout Flow Test',
      'Test the new checkout process for usability issues and friction points',
      'https://demo-store.example.com/checkout',
      'usability',
      'completed',
      20,
      15,
      5,
      200.00,
      NOW() - INTERVAL '7 days'
    ) RETURNING id INTO test_request_id;
    
    -- Add some test runs for this request
    INSERT INTO test_runs (
      test_request_id,
      persona_id,
      status,
      friction_score,
      sentiment_score,
      created_at,
      completed_at
    )
    SELECT 
      test_request_id,
      p.id,
      'completed',
      0.3 + (random() * 0.4),
      0.6 + (random() * 0.3),
      NOW() - INTERVAL '6 days',
      NOW() - INTERVAL '6 days' + INTERVAL '15 minutes'
    FROM personas p
    WHERE p.is_public = true
    LIMIT 3;
  END IF;
END $$;


-- ============================================================================
-- DEMO PLATFORM SETTINGS (if not exists)
-- ============================================================================
INSERT INTO platform_settings (
  default_ai_percentage,
  default_human_percentage,
  allow_custom_ratio,
  min_human_tests_per_batch,
  human_test_price,
  ai_test_price,
  platform_fee_percent,
  hitlai_funded_enabled,
  hitlai_monthly_budget,
  cash_payment_enabled,
  equity_payment_enabled,
  hybrid_payment_enabled,
  equity_shares_per_test,
  auto_retrain_threshold,
  confidence_threshold
) VALUES (
  75,
  25,
  true,
  5,
  25.00,
  5.00,
  30,
  true,
  5000.00,
  true,
  true,
  true,
  100,
  50,
  0.85
) ON CONFLICT DO NOTHING;


-- ============================================================================
-- SUMMARY OF DEMO ACCOUNTS
-- ============================================================================
-- 
-- ADMIN ACCOUNT:
--   Email: admin@hitlai.com
--   Password: Demo123!
--   Access: /admin/login -> /admin/digital-twins, /admin/settings, /admin/forge
--   Features: Full platform control, AI twin monitoring, settings management
--
-- COMPANY ACCOUNT:
--   Email: demo@company.com
--   Password: Demo123!
--   Company: Demo Tech Inc.
--   Plan: Pro (100 tests/month)
--   Credits: 250
--   Access: /company/login -> /company/dashboard, /company/tests
--   Features: Create tests, view results, rate testers
--
-- TESTER ACCOUNT:
--   Email: tester@demo.com
--   Password: Demo123!
--   Name: Sarah Johnson
--   Tier: Expert (20% platform fee)
--   Stats: 127 tests completed, 4.7★ rating, $1,778 earned
--   Access: /tester/login -> /tester/dashboard, /tester/performance
--   Features: View available tests, complete tests, track earnings
--
-- ============================================================================

COMMENT ON TABLE companies IS 'Demo company: demo@company.com / Demo123!';
COMMENT ON TABLE human_testers IS 'Demo tester: tester@demo.com / Demo123!';
