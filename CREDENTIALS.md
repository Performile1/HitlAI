# HitlAI Demo Credentials

## Authentication Model

**Simple Model**: One login per company. Only `admin@hitlai.com` has special admin privileges for the HitlAI platform.

## Admin Account (HitlAI Platform Admin)
- **Email**: `admin@hitlai.com`
- **Password**: `demo123`
- **Access**: Full admin panel ONLY - Digital Twins, Settings, Disputes, Flagged Testers, Margin Control, Payment Settings
- **Note**: 
  - This is the ONLY account with admin privileges (checked by email address)
  - **NOT linked to any company** - completely isolated
  - Cannot access company dashboards
  - Only accessible via `/admin/login` portal

## Company Account
- **Email**: `demo@company.com`
- **Password**: `demo123`
- **Company**: Demo Corporation
- **Access**: Create tests, view results, manage company account
- **Note**: One login per company (no multiple roles within company)

## Tester Account
- **Email**: `demo@tester.com`
- **Password**: `demo123`
- **Profile**: Demo Tester (Intermediate level, 4.5 rating, 25 tests completed)
- **Access**: Accept tests, submit results, view earnings

## Database Setup

To use these credentials, you need to run the migrations:

```bash
# Run all migrations
npm run supabase:migrate

# Or manually apply the demo account migrations
# 20260114000000_create_demo_accounts.sql
# 20260114000002_add_admin_account.sql
```

## Authentication Logic

- **Admin Check**: `user.email === 'admin@hitlai.com'`
- **Company Check**: User exists in `company_members` table
- **Tester Check**: User exists in `human_testers` table
- **No role-based permissions** within companies (one login per company)

## Notes

- All accounts use the same password: `demo123`
- Admin authentication is done by checking the email address directly
- Each company has ONE login - no multiple users/roles per company
- Demo data includes sample test requests and tester profiles
- These are for development/testing only - change passwords in production!

## Troubleshooting

If you can't log in:
1. Ensure migrations have been run
2. Check Supabase dashboard to verify users exist in `auth.users`
3. For admin access, verify email is exactly `admin@hitlai.com`
4. Check browser console for authentication errors
