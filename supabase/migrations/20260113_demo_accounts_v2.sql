-- Demo Accounts Migration (Simplified)
-- Creates demo user profiles that match the actual database schema
-- All passwords are: Demo123!

-- IMPORTANT: Run the 20260113_tester_ratings_enhancements.sql migration FIRST
-- This migration depends on those enhanced fields being present

-- ============================================================================
-- DEMO COMPANY USER
-- ============================================================================
-- Email: demo@company.com
-- Password: Demo123!
-- Company Name: Demo Tech Inc.

INSERT INTO companies (
  id,
  name,
  slug,
  industry,
  company_size,
  website,
  plan_type,
  monthly_test_quota,
  tests_used_this_month,
  created_at
) VALUES (
  gen_random_uuid(),
  'Demo Tech Inc.',
  'demo-tech-inc',
  'technology',
  'medium',
  'https://demotech.example.com',
  'pro',
  100,
  15,
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  monthly_test_quota = EXCLUDED.monthly_test_quota;


-- ============================================================================
-- DEMO HUMAN TESTER USER
-- ============================================================================
-- Email: tester@demo.com
-- Password: Demo123!
-- Display Name: Sarah Johnson

INSERT INTO human_testers (
  id,
  user_id,
  display_name,
  email,
  
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
  
  -- Performance (simulated for display)
  total_tests_completed,
  average_rating,
  total_ratings,
  avg_communication_rating,
  avg_quality_rating,
  avg_timeliness_rating,
  would_work_again_percent,
  tier,
  platform_fee_percent,
  total_earnings_usd,
  badges,
  
  created_at
) VALUES (
  gen_random_uuid(),
  NULL, -- Will be linked when auth user is created
  'Sarah Johnson',
  'tester@demo.com',
  
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
  
  -- Performance (simulated for display only - no actual test data)
  127,
  4.7,
  89,
  4.8,
  4.7,
  4.6,
  92.5,
  'expert',
  20,
  1778.00,
  ARRAY['top_rated', 'fast_responder'],
  
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  total_tests_completed = EXCLUDED.total_tests_completed,
  average_rating = EXCLUDED.average_rating,
  tier = EXCLUDED.tier;


-- ============================================================================
-- DEMO AI PERSONAS
-- ============================================================================
-- These are AI tester definitions (safe to add - won't affect training data)

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
-- PLATFORM SETTINGS
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
-- SUMMARY
-- ============================================================================
-- 
-- ADMIN ACCOUNT (create manually in Supabase Auth):
--   Email: admin@hitlai.com
--   Password: Demo123!
--   Metadata: {"user_type": "admin"}
--   Login: /admin/login
--
-- COMPANY ACCOUNT (create manually in Supabase Auth):
--   Email: demo@company.com
--   Password: Demo123!
--   Metadata: {"user_type": "company"}
--   Login: /company/login
--   Profile: Demo Tech Inc. (created by this migration)
--
-- TESTER ACCOUNT (create manually in Supabase Auth):
--   Email: tester@demo.com
--   Password: Demo123!
--   Metadata: {"user_type": "tester"}
--   Login: /tester/login
--   Profile: Sarah Johnson (created by this migration)
--
-- AI PERSONAS: 3 demo personas created (Tech-Savvy Millennial, Senior User, Mobile-First Gen Z)
--
-- NO TEST DATA: No test requests or test history to preserve AI training integrity
--
-- ============================================================================
