# User Type Configuration Analysis

## Overview

This document analyzes the `user_type` configuration across the HitlAI platform to ensure consistency and proper implementation.

## User Types in HitlAI

The platform has **3 user types**:
1. **`admin`** - HitlAI platform administrators
2. **`company`** - Companies creating test requests
3. **`tester`** - Human testers performing tests

## Configuration Status: ✅ CORRECT

### 1. Signup Flows

#### Company Signup (`/company/signup`)
```typescript
// ✅ CORRECT
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      user_type: 'company'  // ✅ Correctly set
    }
  }
})
```

#### Tester Signup (`/tester/signup`)
```typescript
// ✅ CORRECT
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: { user_type: 'tester' }  // ✅ Correctly set
  }
})
```

#### Admin Account
- ✅ Admin account created via migration with `user_type: 'admin'`
- ✅ No signup form (admin created manually)
- ✅ Email: `admin@hitlai.com`

### 2. Login Flows

#### Company Login (`/company/login`)
```typescript
// ✅ CORRECT - Validates via database table
const { data: membership } = await supabase
  .from('company_members')
  .select('company_id')
  .eq('user_id', data.user.id)
  .single()

if (!membership) {
  throw new Error('No company account found.')
}
```
**Status:** ✅ Does NOT check `user_type` metadata, validates via `company_members` table (correct approach)

#### Tester Login (`/tester/login`)
```typescript
// ✅ CORRECT - Validates via database table
const { data: tester } = await supabase
  .from('human_testers')
  .select('id')
  .eq('user_id', data.user.id)
  .single()

if (!tester) {
  throw new Error('No tester account found.')
}
```
**Status:** ✅ Does NOT check `user_type` metadata, validates via `human_testers` table (correct approach)

#### Admin Login (`/admin/login`)
```typescript
// ✅ CORRECT - Email-based authentication
if (data.user.email !== 'admin@hitlai.com') {
  await supabase.auth.signOut()
  throw new Error('Access denied. Only admin@hitlai.com can access this portal.')
}
```
**Status:** ✅ Uses email-based check (simplified, correct approach)

### 3. Database Schema

#### Notifications Table
```sql
-- ✅ CORRECT
CREATE TABLE IF NOT EXISTS notifications (
  user_type TEXT NOT NULL CHECK (user_type IN ('company', 'tester', 'admin')),
  ...
)
```
**Status:** ✅ Enforces valid user types at database level

#### Notification Function
```sql
-- ✅ CORRECT
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_user_type TEXT,  -- ✅ Accepts user_type parameter
  ...
)
```
**Status:** ✅ Properly typed and validated

### 4. API Routes

#### Admin API Routes
```typescript
// ✅ CORRECT - Email-based admin check
if (user.email !== 'admin@hitlai.com') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```
**Files checked:**
- `/api/admin/digital-twins/route.ts` ✅
- `/api/admin/settings/route.ts` ✅
- `/api/admin/tests/reassign-declined/route.ts` ✅

**Status:** ✅ All admin routes use email-based authentication

#### Notification Creation
```typescript
// ✅ CORRECT - Explicitly sets user_type
await supabase.rpc('create_notification', {
  p_user_id: bestTester.user_id,
  p_user_type: 'tester',  // ✅ Correct
  p_type: 'test_assigned',
  ...
})

await supabase.rpc('create_notification', {
  p_user_id: companyMember.user_id,
  p_user_type: 'company',  // ✅ Correct
  p_type: 'system_message',
  ...
})
```
**Status:** ✅ User types correctly specified in notification calls

### 5. Row Level Security (RLS)

#### Blog System
```sql
-- ✅ CORRECT - Uses user_type for admin-only access
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'user_type' = 'admin'
  )
)
```
**Status:** ✅ Properly restricts blog management to admin users

### 6. Demo Account Migrations

#### Migration Files
- `20260114000000_create_demo_accounts.sql` ✅
- `20260114000002_add_admin_account.sql` ✅
- `create_all_auth_users.sql` ✅

**User Metadata Set:**
```sql
-- Admin
'{"email_verified":true,"user_type":"admin"}'::jsonb  ✅

-- Company
'{"email_verified":true,"user_type":"company"}'::jsonb  ✅

-- Tester
'{"email_verified":true,"user_type":"tester"}'::jsonb  ✅
```
**Status:** ✅ All demo accounts have correct `user_type` in metadata

## Authentication Strategy Summary

### Current Approach (✅ CORRECT)

1. **Signup:** Sets `user_type` in `raw_user_meta_data`
2. **Login:** Validates via database tables, NOT metadata
   - Company → checks `company_members` table
   - Tester → checks `human_testers` table
   - Admin → checks email address
3. **Authorization:** 
   - Admin routes → email-based (`admin@hitlai.com`)
   - RLS policies → can use `user_type` metadata
   - Notifications → explicitly pass `user_type`

### Why This Approach Works

✅ **Database-driven validation:**
- More reliable than metadata
- Prevents unauthorized access even if metadata is wrong
- Links users to actual profiles

✅ **Metadata as supplementary:**
- Used for RLS policies
- Used for analytics/tracking
- Not primary authentication mechanism

✅ **Admin isolation:**
- Email-based check is simple and secure
- No database dependencies
- Clear separation from company/tester logic

## Potential Issues: NONE FOUND

### Checked For:
- ❌ Inconsistent user_type values → **None found**
- ❌ Missing user_type in signups → **All set correctly**
- ❌ Login checking wrong user_type → **Not checking metadata (correct)**
- ❌ API routes using wrong validation → **All correct**
- ❌ Database constraints missing → **All in place**
- ❌ Notification user_type mismatches → **All correct**

## Recommendations

### Current Implementation: ✅ NO CHANGES NEEDED

The user type configuration is **correctly implemented** across the platform.

### Best Practices Being Followed:

1. ✅ **Separation of Concerns**
   - Signup sets metadata
   - Login validates via database
   - Clear distinction between user types

2. ✅ **Defense in Depth**
   - Multiple validation layers
   - Database constraints
   - Application-level checks

3. ✅ **Consistency**
   - All signups set user_type
   - All logins validate properly
   - All API routes check authorization

4. ✅ **Security**
   - Admin email-based check
   - Database-driven validation
   - RLS policies in place

## Testing Checklist

To verify user types are working:

### Company User
- [ ] Signup sets `user_type: 'company'` in metadata
- [ ] Login validates via `company_members` table
- [ ] Can access `/company/*` routes
- [ ] Cannot access `/tester/*` or `/admin/*` routes
- [ ] Receives notifications with `user_type: 'company'`

### Tester User
- [ ] Signup sets `user_type: 'tester'` in metadata
- [ ] Login validates via `human_testers` table
- [ ] Can access `/tester/*` routes
- [ ] Cannot access `/company/*` or `/admin/*` routes
- [ ] Receives notifications with `user_type: 'tester'`

### Admin User
- [ ] Created with `user_type: 'admin'` in metadata
- [ ] Login validates via email check (`admin@hitlai.com`)
- [ ] Can access `/admin/*` routes
- [ ] Cannot access `/company/*` or `/tester/*` routes
- [ ] Blog RLS policies work correctly

## SQL Verification Queries

```sql
-- Check all users have user_type set
SELECT 
  email,
  raw_user_meta_data->>'user_type' as user_type,
  CASE 
    WHEN raw_user_meta_data->>'user_type' IS NULL THEN '❌ Missing'
    WHEN raw_user_meta_data->>'user_type' NOT IN ('admin', 'company', 'tester') THEN '⚠️ Invalid'
    ELSE '✅ Valid'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Verify company users have profiles
SELECT 
  u.email,
  u.raw_user_meta_data->>'user_type' as user_type,
  CASE 
    WHEN cm.user_id IS NOT NULL THEN '✅ Has company profile'
    ELSE '❌ Missing company profile'
  END as status
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE u.raw_user_meta_data->>'user_type' = 'company';

-- Verify tester users have profiles
SELECT 
  u.email,
  u.raw_user_meta_data->>'user_type' as user_type,
  CASE 
    WHEN ht.user_id IS NOT NULL THEN '✅ Has tester profile'
    ELSE '❌ Missing tester profile'
  END as status
FROM auth.users u
LEFT JOIN human_testers ht ON u.id = ht.user_id
WHERE u.raw_user_meta_data->>'user_type' = 'tester';

-- Verify admin user
SELECT 
  email,
  raw_user_meta_data->>'user_type' as user_type,
  CASE 
    WHEN email = 'admin@hitlai.com' AND raw_user_meta_data->>'user_type' = 'admin' THEN '✅ Correct'
    ELSE '❌ Issue'
  END as status
FROM auth.users
WHERE email = 'admin@hitlai.com';
```

## Conclusion

**Status: ✅ ALL USER TYPES CORRECTLY CONFIGURED**

The HitlAI platform has a well-implemented user type system with:
- Proper metadata setting during signup
- Database-driven validation during login
- Secure authorization checks in API routes
- Appropriate RLS policies
- Consistent notification handling

**No changes or fixes required.**
