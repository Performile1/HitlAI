-- Create All Demo Auth Users at Once
-- This script creates admin, company, and tester users with proper metadata

-- ============================================================================
-- DELETE EXISTING USERS (if any)
-- ============================================================================

DELETE FROM auth.users WHERE email IN ('admin@hitlai.com', 'demo@company.com', 'tester@demo.com');

-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@hitlai.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email_verified":true,"user_type":"admin"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- ============================================================================
-- CREATE COMPANY USER
-- ============================================================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@company.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email_verified":true,"user_type":"company"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- ============================================================================
-- CREATE TESTER USER
-- ============================================================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tester@demo.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email_verified":true,"user_type":"tester"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- ============================================================================
-- VERIFY ALL USERS CREATED
-- ============================================================================

SELECT 
  'VERIFICATION' as check_type,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email IN ('admin@hitlai.com', 'demo@company.com', 'tester@demo.com')
ORDER BY email;

-- Expected Results:
-- admin@hitlai.com    | admin   | true | timestamp
-- demo@company.com    | company | true | timestamp
-- tester@demo.com     | tester  | true | timestamp
