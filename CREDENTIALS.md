# HitlAI Demo Credentials

## Admin Account
- **Email**: `admin@hitlai.com`
- **Password**: `demo123`
- **Role**: Admin
- **Access**: Full admin panel access including Digital Twins, Settings, Forge, etc.

## Company Account
- **Email**: `demo@company.com`
- **Password**: `demo123`
- **Role**: Company Owner
- **Company**: Demo Corporation
- **Access**: Create tests, view results, manage team

## Tester Account
- **Email**: `demo@tester.com`
- **Password**: `demo123`
- **Role**: Human Tester
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

## Notes

- All accounts use the same password: `demo123`
- The admin account has special privileges via the `company_members` table with `role = 'admin'`
- Demo data includes sample test requests and tester profiles
- These are for development/testing only - change passwords in production!

## Troubleshooting

If you can't log in:
1. Ensure migrations have been run
2. Check Supabase dashboard to verify users exist in `auth.users`
3. Verify `company_members` table has the correct role assignments
4. Check browser console for authentication errors
