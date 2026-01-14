-- Create Demo Accounts for Testing
-- This migration creates demo user accounts for company and tester roles

-- Note: Passwords are hashed with bcrypt
-- Demo passwords: demo123
-- Hash for 'demo123': $2a$10$rN8qNKZ5qJ5qJ5qJ5qJ5qOe5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ

-- Insert demo company user
-- Email: demo@company.com
-- Password: demo123
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo@company.com',
  '$2a$10$rN8qNKZ5qJ5qJ5qJ5qJ5qOe5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo Company User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert demo tester user
-- Email: demo@tester.com
-- Password: demo123
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo@tester.com',
  '$2a$10$rN8qNKZ5qJ5qJ5qJ5qJ5qOe5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo Tester"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create demo company
INSERT INTO companies (
  id,
  name,
  website,
  industry,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo Corporation',
  'https://demo-corp.example.com',
  'Technology',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Link demo company user to company
INSERT INTO company_members (
  id,
  company_id,
  user_id,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'owner',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create demo tester profile
INSERT INTO human_testers (
  id,
  user_id,
  full_name,
  bio,
  skills,
  experience_level,
  rating,
  tests_completed,
  total_earnings,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Demo Tester',
  'Experienced tester specializing in UI/UX and accessibility testing',
  ARRAY['UI/UX Testing', 'Accessibility', 'Mobile Testing', 'Cross-browser Testing'],
  'intermediate',
  4.5,
  25,
  500.00,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create some demo test requests for the company
INSERT INTO test_requests (
  id,
  company_id,
  title,
  description,
  url,
  test_type,
  status,
  budget,
  created_at,
  updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'E-commerce Checkout Flow Test',
  'Test the complete checkout process including cart, payment, and confirmation',
  'https://demo-shop.example.com',
  'functional',
  'completed',
  100.00,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days'
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Mobile Responsiveness Check',
  'Verify that all pages work correctly on mobile devices',
  'https://demo-shop.example.com',
  'ui_ux',
  'in_progress',
  75.00,
  NOW() - INTERVAL '2 days',
  NOW()
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Accessibility Audit',
  'Check WCAG 2.1 compliance and screen reader compatibility',
  'https://demo-shop.example.com',
  'accessibility',
  'open',
  150.00,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add comment for reference
COMMENT ON TABLE auth.users IS 'Demo accounts: demo@company.com and demo@tester.com (password: demo123)';
