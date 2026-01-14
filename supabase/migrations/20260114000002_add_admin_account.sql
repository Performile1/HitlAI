-- Add HitlAI admin account
-- Simple authentication model: One login per company, only admin@hitlai.com has special admin privileges

-- Insert admin user (admin@hitlai.com)
-- This is the only account with admin privileges for the HitlAI platform
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
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@hitlai.com',
  '$2a$10$rN8qNKZ5qJ5qJ5qJ5qJ5qOe5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"HitlAI Admin"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Note: Admin authentication is done by checking email === 'admin@hitlai.com'
-- No need for role-based checks in company_members table
-- Each company has one login, admin@hitlai.com is separate and has platform-wide admin access

COMMENT ON TABLE auth.users IS 'Admin account: admin@hitlai.com (password: demo123) - Platform admin with special privileges';
