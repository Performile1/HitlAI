-- Migration: Create Demo User Accounts
-- Purpose: Set up demo accounts for testing the platform
-- Date: 2026-01-21

-- Note: Demo users must be created through Supabase Auth UI or API
-- This migration creates the associated records in our tables

-- Demo Tester Account
-- Email: demo@tester.com
-- Password: demo123 (must be created manually in Supabase Auth)
-- This SQL assumes the auth.users record exists with a specific UUID

-- Insert demo tester into human_testers table
-- Replace the UUID below with the actual UUID from auth.users after creating the demo user
INSERT INTO human_testers (
  user_id,
  full_name,
  email,
  expertise_areas,
  hourly_rate,
  availability_status,
  total_tests_completed,
  average_rating,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Placeholder UUID - replace with actual
  'Demo Tester',
  'demo@tester.com',
  ARRAY['Web Applications', 'Mobile Apps', 'API Testing'],
  25.00,
  'available',
  150,
  4.8,
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  expertise_areas = EXCLUDED.expertise_areas,
  hourly_rate = EXCLUDED.hourly_rate,
  availability_status = EXCLUDED.availability_status,
  total_tests_completed = EXCLUDED.total_tests_completed,
  average_rating = EXCLUDED.average_rating;

-- Demo Company Account
-- Email: demo@company.com
-- Password: demo123 (must be created manually in Supabase Auth)
INSERT INTO companies (
  id,
  name,
  website,
  industry,
  company_size,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid, -- Placeholder UUID
  'Demo Company Inc.',
  'https://democompany.com',
  'Technology',
  '11-50',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  industry = EXCLUDED.industry,
  company_size = EXCLUDED.company_size;

-- Create company member association for demo company user
-- This assumes auth.users record exists for demo@company.com
INSERT INTO company_members (
  company_id,
  user_id,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid, -- Placeholder for company user UUID
  'admin',
  NOW()
) ON CONFLICT (company_id, user_id) DO NOTHING;

-- Initialize milestone progress for demo company
INSERT INTO milestone_progress (
  company_id,
  total_tests_completed,
  tests_last_30_days,
  high_quality_tests,
  current_phase,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  45,
  12,
  38,
  'phase1',
  NOW()
) ON CONFLICT (company_id) DO UPDATE SET
  total_tests_completed = EXCLUDED.total_tests_completed,
  tests_last_30_days = EXCLUDED.tests_last_30_days,
  high_quality_tests = EXCLUDED.high_quality_tests,
  current_phase = EXCLUDED.current_phase;

-- Add some sample test runs for the demo company
INSERT INTO test_runs (
  id,
  company_id,
  test_url,
  test_type,
  status,
  company_ai_rating,
  created_at,
  completed_at
) VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'https://example.com', 'functional', 'completed', 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'https://example.com/login', 'functional', 'completed', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'https://example.com/checkout', 'functional', 'completed', 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Instructions for manual setup:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" and create:
--    - Email: demo@tester.com, Password: demo123
--    - Email: demo@company.com, Password: demo123
-- 3. Copy the UUID of each created user
-- 4. Update this migration file with the actual UUIDs
-- 5. Run this migration to create the associated records

-- Alternative: Use Supabase API to create users programmatically
-- This requires the service role key and should be done server-side
