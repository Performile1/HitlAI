# Create Demo User Accounts

## Problem
The tester demo login (`demo@tester.com` / `demo123`) is failing with a 400 error because the user account doesn't exist in Supabase Auth.

## Solution: Create Demo Users Manually

### Step 1: Create Auth Users in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** (or "Invite")
3. Create the following users:

#### Demo Tester Account
- **Email:** `demo@tester.com`
- **Password:** `demo123`
- **Auto Confirm User:** ✅ Yes (important!)
- Click **"Create User"**
- **Copy the UUID** that gets generated

#### Demo Company Account (Optional)
- **Email:** `demo@company.com`
- **Password:** `demo123`
- **Auto Confirm User:** ✅ Yes
- Click **"Create User"**
- **Copy the UUID** that gets generated

---

### Step 2: Create Associated Database Records

After creating the auth users, run this SQL in **Supabase SQL Editor**:

```sql
-- Replace YOUR_TESTER_UUID with the actual UUID from Step 1
DO $$
DECLARE
  tester_uuid UUID := 'YOUR_TESTER_UUID_HERE'::uuid;  -- REPLACE THIS
  company_uuid UUID := 'YOUR_COMPANY_UUID_HERE'::uuid;  -- REPLACE THIS
  company_id UUID := gen_random_uuid();
BEGIN
  -- Create demo tester record
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
    tester_uuid,
    'Demo Tester',
    'demo@tester.com',
    ARRAY['Web Applications', 'Mobile Apps', 'API Testing'],
    25.00,
    'available',
    150,
    4.8,
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Create demo company
  INSERT INTO companies (
    id,
    name,
    website,
    industry,
    company_size,
    created_at
  ) VALUES (
    company_id,
    'Demo Company Inc.',
    'https://democompany.com',
    'Technology',
    '11-50',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Create company member association
  INSERT INTO company_members (
    company_id,
    user_id,
    role,
    created_at
  ) VALUES (
    company_id,
    company_uuid,
    'admin',
    NOW()
  ) ON CONFLICT (company_id, user_id) DO NOTHING;

  -- Initialize milestone progress
  INSERT INTO milestone_progress (
    company_id,
    total_tests_completed,
    tests_last_30_days,
    high_quality_tests,
    current_phase,
    created_at
  ) VALUES (
    company_id,
    45,
    12,
    38,
    'phase1',
    NOW()
  ) ON CONFLICT (company_id) DO NOTHING;

  -- Add sample test runs
  INSERT INTO test_runs (
    company_id,
    test_url,
    test_type,
    status,
    company_ai_rating,
    created_at,
    completed_at
  ) VALUES 
    (company_id, 'https://example.com', 'functional', 'completed', 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (company_id, 'https://example.com/login', 'functional', 'completed', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    (company_id, 'https://example.com/checkout', 'functional', 'completed', 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

  RAISE NOTICE 'Demo users created successfully!';
END $$;
```

---

### Step 3: Test the Login

1. Go to your deployed site: `https://your-app.vercel.app/tester/login`
2. Click **"Use Demo Credentials"** button
3. Click **"Sign In"**
4. You should be redirected to `/tester/dashboard`

---

### Step 4: Test Company Login

1. Go to your deployed site: `https://your-app.vercel.app/company/login`
2. Click **"Use Demo Credentials"** button
3. Click **"Sign In"**
4. You should be redirected to `/company/dashboard`

---

## Quick Copy-Paste Version

If you want to create just the tester account quickly:

```sql
-- 1. First, create the auth user in Supabase Dashboard
-- 2. Then run this (replace the UUID):

INSERT INTO human_testers (
  user_id,
  full_name,
  email,
  expertise_areas,
  hourly_rate,
  availability_status,
  total_tests_completed,
  average_rating
) VALUES (
  'PASTE_UUID_HERE'::uuid,
  'Demo Tester',
  'demo@tester.com',
  ARRAY['Web Applications', 'Mobile Apps', 'API Testing'],
  25.00,
  'available',
  150,
  4.8
) ON CONFLICT (user_id) DO NOTHING;
```

---

## Troubleshooting

### Error: "Multiple GoTrueClient instances detected"
This is a warning, not an error. It happens when multiple Supabase clients are created. It won't prevent login from working.

### Error: 400 Bad Request
- **Cause:** User doesn't exist in Supabase Auth
- **Fix:** Create the user in Supabase Dashboard (Step 1 above)

### Error: "No tester account found"
- **Cause:** User exists in auth but not in `human_testers` table
- **Fix:** Run the SQL in Step 2 above

### Error: "Invalid login credentials"
- **Cause:** Wrong password or email
- **Fix:** Verify you created the user with email `demo@tester.com` and password `demo123`

---

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Create user via API (requires service role key)
supabase auth create-user demo@tester.com --password demo123
```

Then run the SQL from Step 2.
