# HitlAI - Quick Start Guide

**For Developers** - Get the platform running locally in 10 minutes

---

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- OpenAI API key
- Git

---

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd HitlAI
npm install
```

---

## Step 2: Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required - Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required - Get from OpenAI
OPENAI_API_KEY=sk-proj-your-key

# Required - Get from Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key

# Optional - For email notifications
RESEND_API_KEY=re_your-key

# Optional - For payments
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# Admin account
ADMIN_EMAIL=your-email@example.com
```

---

## Step 3: Set Up Database

### Apply Migrations

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually in Supabase Dashboard
# Go to SQL Editor and run each migration file in order
```

### Verify Tables Created

Check that these tables exist in your Supabase dashboard:
- `companies`
- `human_testers`
- `test_runs`
- `issues`
- `platform_milestones`
- `early_adopter_applications`
- `founding_tester_applications`
- `training_data`

---

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Create Test Accounts

### Create Company Account

1. Go to http://localhost:3000/company/signup
2. Fill in company details
3. Verify email (check Supabase Auth logs)
4. Login at http://localhost:3000/company/login

### Create Tester Account

1. Go to http://localhost:3000/tester/signup
2. Fill in tester profile
3. Verify email
4. Login at http://localhost:3000/tester/login

### Admin Access

Use the email you set in `ADMIN_EMAIL` to access:
- http://localhost:3000/admin/login

---

## Step 6: Test Core Functionality

### Test AI Test Creation

1. Login as company
2. Go to Dashboard → Create New Test
3. Fill in:
   - URL: `https://example.com`
   - Mission: "Test the homepage for usability issues"
   - Select AI-only (100% AI slider)
4. Submit test
5. Check test status in dashboard

### Test API Endpoints

Use the Postman collection at `docs/HitlAI_Postman_Collection.json`:

1. Import into Postman
2. Set `base_url` to `http://localhost:3000`
3. Run "Company Login" to get access token
4. Test other endpoints

---

## Common Issues & Solutions

### Issue: "Supabase URL not found"
**Solution**: Make sure `.env.local` exists and has `NEXT_PUBLIC_SUPABASE_URL`

### Issue: "Database table not found"
**Solution**: Run all migrations in order. Check Supabase dashboard → Database → Tables

### Issue: "OpenAI API error"
**Solution**: Verify `OPENAI_API_KEY` is valid and has credits

### Issue: "Cannot create test"
**Solution**: Check that `platform_milestones` table has initial data. Run:
```sql
SELECT * FROM platform_milestones;
```

### Issue: "RLS policy error"
**Solution**: Verify RLS policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'test_runs';
```

---

## API Testing with Postman

### Import Collection
1. Open Postman
2. Import → File → Select `docs/HitlAI_Postman_Collection.json`
3. Set environment variable `base_url` = `http://localhost:3000`

### Get Access Token
1. Run "Company Login" or "Tester Login"
2. Token is automatically saved to `access_token` variable
3. All subsequent requests use this token

### Test Endpoints
- Create test: `POST /api/test-runs`
- List tests: `GET /api/test-runs`
- Get test details: `GET /api/test-runs/{id}`
- Rate test: `POST /api/test-runs/{id}/rate`

---

## Development Workflow

### Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally

# Commit
git add .
git commit -m "Add feature"

# Push
git push origin feature/your-feature
```

### Database Changes

```bash
# Create new migration
supabase migration new your_migration_name

# Edit migration file in supabase/migrations/

# Apply migration
supabase db push

# Or apply manually in Supabase Dashboard SQL Editor
```

### Testing Changes

```bash
# Run development server
npm run dev

# In another terminal, run tests (if available)
npm test

# Check TypeScript errors
npm run type-check
```

---

## Project Structure

```
HitlAI/
├── app/                      # Next.js app directory
│   ├── (marketing)/         # Public pages
│   ├── company/             # Company portal
│   ├── tester/              # Tester portal
│   ├── admin/               # Admin panel
│   └── api/                 # API routes
│       ├── test-runs/       # Test management
│       ├── company/         # Company endpoints
│       ├── tester/          # Tester endpoints
│       └── admin/           # Admin endpoints
├── components/              # React components
├── lib/                     # Utilities and services
│   ├── orchestrator.ts      # Test orchestration
│   ├── training/            # AI training
│   └── milestones/          # Progress tracking
├── supabase/
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

---

## Next Steps

1. **Read the docs**:
   - `docs/MASTER_TECHNICAL_DOCUMENTATION.md` - System overview
   - `docs/API_DOCUMENTATION.md` - API reference
   - `docs/PRE_FLIGHT_AUDIT_REPORT.md` - Known issues

2. **Check implementation progress**:
   - `docs/IMPLEMENTATION_PROGRESS.md` - What's done and what's left

3. **Review the audit report**:
   - `docs/PRE_FLIGHT_AUDIT_REPORT.md` - Critical issues to fix

4. **Start developing**:
   - Pick an issue from the audit report
   - Create a branch
   - Implement the fix
   - Test thoroughly
   - Submit PR

---

## Getting Help

### Documentation
- Technical docs: `docs/MASTER_TECHNICAL_DOCUMENTATION.md`
- API docs: `docs/API_DOCUMENTATION.md`
- Database schema: `docs/DATABASE_SCHEMA.md`
- User flows: `docs/USER_FLOWS.md`

### Debugging
- Check browser console for frontend errors
- Check terminal for backend errors
- Check Supabase logs for database errors
- Use Postman to test API endpoints directly

### Common Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
```

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all variables from `.env.example` in your deployment platform:
- Supabase credentials
- API keys (OpenAI, Anthropic)
- Email service (Resend)
- Payment (Stripe)
- Admin email

---

**You're ready to start developing!** 🚀

For questions or issues, refer to the documentation in the `docs/` folder.
