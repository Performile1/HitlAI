-- Create Demo User Database Records
-- Run this AFTER creating auth users in Supabase Dashboard
-- Replace the UUIDs with actual values from auth.users

-- Instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create demo@tester.com with password demo123 (Auto Confirm: Yes)
-- 3. Create demo@company.com with password demo123 (Auto Confirm: Yes)
-- 4. Copy both UUIDs and replace them below
-- 5. Run this SQL in Supabase SQL Editor

DO $$
DECLARE
  tester_uuid UUID := 'e9e0f08d-956d-4544-a4c3-99d5b66676d3'::uuid;  -- tester@demo.com
  company_user_uuid UUID := '1300dde5-8081-4723-86fd-39e5a447f1b0'::uuid;  -- demo@company.com
  v_company_id UUID := gen_random_uuid();
BEGIN
  -- Create demo tester record
  INSERT INTO human_testers (
    user_id,
    display_name,
    bio,
    age,
    tech_literacy,
    primary_device,
    location_country,
    languages,
    total_tests_completed,
    average_rating,
    specialties,
    is_available,
    hourly_rate_usd,
    is_verified,
    created_at
  ) VALUES (
    tester_uuid,
    'Demo Tester',
    'Experienced QA tester specializing in web and mobile applications',
    28,
    'high',
    'desktop',
    'US',
    ARRAY['en'],
    150,
    4.8,
    ARRAY['e-commerce', 'accessibility', 'mobile'],
    true,
    25.00,
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    total_tests_completed = EXCLUDED.total_tests_completed,
    average_rating = EXCLUDED.average_rating;

  -- Create demo company
  INSERT INTO companies (
    id,
    name,
    slug,
    website,
    industry,
    company_size,
    plan_type,
    monthly_test_quota,
    tests_used_this_month,
    created_at
  ) VALUES (
    v_company_id,
    'Demo Company Inc.',
    'demo-company',
    'https://democompany.com',
    'Technology',
    'small',
    'pro',
    100,
    45,
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Link company user to company
  INSERT INTO company_members (
    company_id,
    user_id,
    role,
    created_at
  ) VALUES (
    v_company_id,
    company_user_uuid,
    'admin',
    NOW()
  ) ON CONFLICT (company_id, user_id) DO NOTHING;

  -- Add sample test runs (requires migration 20260121000002_add_company_id_to_test_runs.sql to be run first)
  INSERT INTO test_runs (
    company_id,
    user_id,
    url,
    mission,
    persona,
    platform,
    status,
    company_ai_rating,
    created_at,
    completed_at
  ) VALUES 
    (v_company_id, company_user_uuid, 'https://example.com', 'Test homepage functionality', 'Tech-savvy user', 'web', 'completed', 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (v_company_id, company_user_uuid, 'https://example.com/login', 'Test login flow', 'Average user', 'web', 'completed', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    (v_company_id, company_user_uuid, 'https://example.com/checkout', 'Test checkout process', 'First-time buyer', 'web', 'completed', 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (v_company_id, company_user_uuid, 'https://example.com/dashboard', 'Test dashboard features', 'Power user', 'web', 'completed', 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_company_id, company_user_uuid, 'https://example.com/profile', 'Test profile editing', 'Casual user', 'web', 'completed', 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- Initialize milestone progress for demo company (will be auto-updated by trigger)
  INSERT INTO milestone_progress (
    company_id,
    total_tests_completed,
    tests_last_30_days,
    high_quality_tests,
    current_phase,
    created_at
  ) VALUES (
    v_company_id,
    0,
    0,
    0,
    'phase1',
    NOW()
  ) ON CONFLICT (company_id) DO NOTHING;

  RAISE NOTICE 'Demo users created successfully! Company ID: %', v_company_id;
END $$;
