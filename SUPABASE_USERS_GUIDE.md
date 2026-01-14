# Supabase Users & Registration Guide

## Checking Users in Supabase

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your project
3. Navigate to **Authentication** → **Users** in the left sidebar

### 2. Expected Demo Users

After running migrations, you should see these users in `auth.users`:

| Email | User Type | Created By | Purpose |
|-------|-----------|------------|---------|
| `admin@hitlai.com` | Admin | Migration | HitlAI platform admin |
| `demo@company.com` | Company | Migration | Demo company account |
| `demo@tester.com` | Tester | Migration | Demo tester account |

### 3. User Verification Checklist

For each user, verify:
- ✅ Email is confirmed (`email_confirmed_at` is set)
- ✅ User has correct `user_type` in `raw_user_meta_data`
- ✅ User is linked to correct table:
  - Admin: No company link (isolated)
  - Company: Has entry in `company_members` table
  - Tester: Has entry in `human_testers` table

### 4. SQL Queries to Check Users

```sql
-- Check all users
SELECT id, email, email_confirmed_at, raw_user_meta_data->>'user_type' as user_type
FROM auth.users
ORDER BY created_at DESC;

-- Check company members
SELECT cm.*, c.name as company_name, u.email
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
JOIN auth.users u ON cm.user_id = u.id;

-- Check human testers
SELECT ht.display_name, ht.email, ht.tech_literacy, ht.is_verified, u.email as auth_email
FROM human_testers ht
JOIN auth.users u ON ht.user_id = u.id;

-- Verify admin has no company link
SELECT u.email, cm.company_id
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE u.email = 'admin@hitlai.com';
-- Should return: admin@hitlai.com with NULL company_id
```

## Registration Flows

### Company Registration (`/company/signup`)

**Process:**
1. User fills form: email, password, company name, website, industry
2. Creates auth user with `user_type: 'company'`
3. Creates company record in `companies` table
4. Links user to company in `company_members` with `role: 'owner'`
5. Redirects to `/company/dashboard`

**Test Registration:**
```
Email: test-company@example.com
Password: testpass123
Company Name: Test Corp
Website: https://testcorp.com
Industry: Technology
```

**Verify in Supabase:**
```sql
-- Check user was created
SELECT * FROM auth.users WHERE email = 'test-company@example.com';

-- Check company was created
SELECT * FROM companies WHERE name = 'Test Corp';

-- Check user is linked to company
SELECT cm.*, c.name 
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
JOIN auth.users u ON cm.user_id = u.id
WHERE u.email = 'test-company@example.com';
```

### Tester Registration (`/tester/signup`)

**Process:**
1. User fills 5-step form with profile info
2. Creates auth user with `user_type: 'tester'`
3. Creates tester profile in `human_testers` table with:
   - Demographics (age, gender, location)
   - Skills (tech literacy, experience, specialties)
   - Preferences (test types, industries, availability)
   - Payment info (method, rates)
4. Redirects to `/tester/dashboard`

**Test Registration:**
```
Step 1 - Account:
  Email: test-tester@example.com
  Password: testpass123
  Display Name: Test Tester

Step 2 - Demographics:
  Age: 30
  Gender: Male
  Occupation: Software Engineer
  Education: Bachelor's Degree
  Country: United States

Step 3 - Experience:
  Tech Literacy: High
  Primary Device: Desktop
  Years of Testing: 2
  Previous Platforms: [usertesting, userlytics]

Step 4 - Preferences:
  Test Types: [ecommerce, accessibility, mobile_apps]
  Industries: [fintech, technology]
  Min Duration: 10 minutes
  Max Duration: 60 minutes
  Max Tests/Week: 10

Step 5 - Payment:
  Method: Stripe
```

**Verify in Supabase:**
```sql
-- Check user was created
SELECT * FROM auth.users WHERE email = 'test-tester@example.com';

-- Check tester profile was created
SELECT * FROM human_testers WHERE email = 'test-tester@example.com';

-- Check tester details
SELECT 
  display_name,
  age,
  tech_literacy,
  preferred_test_types,
  is_available,
  is_verified
FROM human_testers 
WHERE email = 'test-tester@example.com';
```

## Common Issues & Solutions

### Issue: User created but not in company_members/human_testers
**Cause:** Database insert failed after auth signup
**Solution:** Check Supabase logs, verify table permissions
```sql
-- Clean up orphaned user
DELETE FROM auth.users WHERE email = 'problematic@email.com';
```

### Issue: Email not confirmed
**Cause:** Email confirmation disabled or email not sent
**Solution:** 
1. In Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations" for development
3. Or manually confirm:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

### Issue: Can't login after signup
**Cause:** User type mismatch or missing profile
**Solution:** Verify user exists in correct table:
```sql
-- For company users
SELECT u.email, cm.company_id 
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE u.email = 'company@example.com';

-- For testers
SELECT u.email, ht.id as tester_id
FROM auth.users u
LEFT JOIN human_testers ht ON u.id = ht.user_id
WHERE u.email = 'tester@example.com';
```

## Testing Registration

### Manual Testing Steps

**1. Company Registration:**
```bash
# Navigate to signup
http://localhost:3000/company/signup

# Fill form and submit
# Check Supabase Dashboard → Authentication → Users
# Verify new user appears
# Check Tables → companies (new company)
# Check Tables → company_members (user linked)

# Try logging in
http://localhost:3000/company/login
# Should redirect to /company/dashboard
```

**2. Tester Registration:**
```bash
# Navigate to signup
http://localhost:3000/tester/signup

# Complete all 5 steps
# Check Supabase Dashboard → Authentication → Users
# Verify new user appears
# Check Tables → human_testers (new profile)

# Try logging in
http://localhost:3000/tester/login
# Should redirect to /tester/dashboard
```

### Automated Testing (Future)

```typescript
// Example test for company registration
describe('Company Registration', () => {
  it('should create user, company, and link them', async () => {
    const email = `test-${Date.now()}@example.com`
    
    // Submit registration form
    await page.goto('/company/signup')
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', 'testpass123')
    await page.fill('[name="companyName"]', 'Test Company')
    await page.click('button[type="submit"]')
    
    // Verify redirect
    await expect(page).toHaveURL('/company/dashboard')
    
    // Verify in database
    const user = await supabase.auth.admin.getUserByEmail(email)
    expect(user).toBeTruthy()
    
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('name', 'Test Company')
      .single()
    expect(company).toBeTruthy()
  })
})
```

## Migration Commands

```bash
# Run all migrations (creates demo users)
npm run supabase:migrate

# Or manually apply specific migrations
psql $DATABASE_URL -f supabase/migrations/20260114000000_create_demo_accounts.sql
psql $DATABASE_URL -f supabase/migrations/20260114000002_add_admin_account.sql

# Reset database (careful - deletes all data!)
supabase db reset

# Check migration status
supabase migration list
```

## Security Notes

- ✅ Passwords are hashed by Supabase Auth
- ✅ Email confirmation can be enabled in production
- ✅ Row Level Security (RLS) should be enabled on all tables
- ✅ Admin account is isolated (no company access)
- ⚠️ Demo passwords (`demo123`) should be changed in production
- ⚠️ Ensure proper RLS policies are set for `companies`, `company_members`, `human_testers`

## Next Steps

1. **Enable RLS policies** for production security
2. **Set up email templates** for confirmation emails
3. **Add email verification** flow for new signups
4. **Implement password reset** functionality
5. **Add profile editing** for companies and testers
6. **Set up proper error handling** and user feedback
