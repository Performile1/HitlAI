-- Add admin account and fix authentication for admin panel

-- Insert admin user (admin@hitlai.com)
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
  '{"name":"HitlAI Admin","role":"admin"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create admin company
INSERT INTO companies (
  id,
  name,
  slug,
  website,
  industry,
  plan_type,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  'HitlAI Admin',
  'hitlai-admin',
  'https://hitlai.com',
  'Technology',
  'enterprise',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Link admin user to admin company with admin role
INSERT INTO company_members (
  id,
  company_id,
  user_id,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000010'::uuid,
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE company_members IS 'Admin account: admin@hitlai.com (password: demo123, role: admin)';
