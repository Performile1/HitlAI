-- Check if demo auth users exist in Supabase
-- Run this in Supabase SQL Editor to verify demo accounts are set up

-- ============================================================================
-- CHECK AUTH USERS
-- ============================================================================

SELECT 
  'AUTH USERS CHECK' as check_type,
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

-- ============================================================================
-- CHECK COMPANY PROFILE
-- ============================================================================

SELECT 
  'COMPANY PROFILE CHECK' as check_type,
  c.id,
  c.name,
  c.slug,
  c.plan_type,
  c.monthly_test_quota,
  c.tests_used_this_month,
  u.email as linked_email
FROM companies c
LEFT JOIN auth.users u ON u.email = 'demo@company.com'
WHERE c.slug = 'demo-tech-inc';

-- Expected: Demo Tech Inc. | pro | 100 quota | 15 used

-- ============================================================================
-- CHECK TESTER PROFILE
-- ============================================================================

SELECT 
  'TESTER PROFILE CHECK' as check_type,
  ht.id,
  ht.display_name,
  ht.email,
  ht.tier,
  ht.average_rating,
  ht.total_tests_completed,
  ht.total_earnings_usd,
  ht.total_ai_training_earnings,
  u.email as auth_email
FROM human_testers ht
LEFT JOIN auth.users u ON u.email = 'tester@demo.com'
WHERE ht.email = 'tester@demo.com';

-- Expected: Sarah Johnson | expert | 4.7 rating | 127 tests | $1,778 earned

-- ============================================================================
-- CHECK AI PERSONAS
-- ============================================================================

SELECT 
  'AI PERSONAS CHECK' as check_type,
  COUNT(*) as total_personas,
  COUNT(*) FILTER (WHERE is_default = true) as default_personas,
  COUNT(*) FILTER (WHERE is_active = true) as active_personas
FROM personas;

-- Expected: Multiple personas created

-- ============================================================================
-- CHECK PLATFORM SETTINGS
-- ============================================================================

SELECT 
  'PLATFORM SETTINGS CHECK' as check_type,
  default_ai_percentage,
  default_human_percentage,
  human_test_price,
  ai_test_price,
  platform_fee_percent,
  human_tester_flag_threshold,
  human_tester_disable_threshold,
  ai_tester_flag_threshold,
  ai_tester_disable_threshold,
  ai_revenue_sharing_enabled,
  ai_revenue_pool_percent,
  trainer_share_per_ai_test,
  min_training_tests_for_share
FROM platform_settings
LIMIT 1;

-- Expected: All settings configured with defaults

-- ============================================================================
-- MISSING USERS REPORT
-- ============================================================================

WITH expected_users AS (
  SELECT 'admin@hitlai.com' as email, 'admin' as user_type
  UNION ALL
  SELECT 'demo@company.com', 'company'
  UNION ALL
  SELECT 'tester@demo.com', 'tester'
)
SELECT 
  'MISSING USERS' as check_type,
  eu.email,
  eu.user_type,
  CASE 
    WHEN au.email IS NULL THEN '❌ MISSING - Create in Supabase Dashboard'
    WHEN au.raw_user_meta_data->>'user_type' IS NULL THEN '⚠️ EXISTS but missing user_type metadata'
    WHEN au.email_confirmed_at IS NULL THEN '⚠️ EXISTS but email not confirmed'
    ELSE '✅ OK'
  END as status
FROM expected_users eu
LEFT JOIN auth.users au ON eu.email = au.email;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'SUMMARY' as check_type,
  (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@hitlai.com', 'demo@company.com', 'tester@demo.com')) as auth_users_created,
  (SELECT COUNT(*) FROM companies WHERE slug = 'demo-tech-inc') as company_profiles_created,
  (SELECT COUNT(*) FROM human_testers WHERE email = 'tester@demo.com') as tester_profiles_created,
  (SELECT COUNT(*) FROM personas) as ai_personas_created,
  (SELECT COUNT(*) FROM platform_settings) as platform_settings_configured;

-- Expected: 3 auth users, 1 company, 1 tester, multiple personas, 1 settings row

-- ============================================================================
-- INSTRUCTIONS IF USERS ARE MISSING
-- ============================================================================

/*

IF AUTH USERS ARE MISSING:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" for each missing user:

ADMIN USER:
- Email: admin@hitlai.com
- Password: Demo123!
- Auto Confirm: ✅ Yes
- User Metadata: {"user_type": "admin"}

COMPANY USER:
- Email: demo@company.com
- Password: Demo123!
- Auto Confirm: ✅ Yes
- User Metadata: {"user_type": "company"}

TESTER USER:
- Email: tester@demo.com
- Password: Demo123!
- Auto Confirm: ✅ Yes
- User Metadata: {"user_type": "tester"}

3. Run this check script again to verify

*/
