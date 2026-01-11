# HitlAI Deployment Checklist

Complete guide to deploy the full HitlAI platform.

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Accounts created:
  - [ ] Supabase
  - [ ] Vercel
  - [ ] Stripe
  - [ ] Resend (email)
  - [ ] OpenAI
  - [ ] Anthropic

---

## 1. Database Setup (Supabase)

### 1.1 Create Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Create new project
- [ ] Save database password

### 1.2 Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

Or manually in SQL Editor (in order):
- [ ] Run `20260108_initial_schema.sql`
- [ ] Run `20260108_add_guideline_citations.sql`
- [ ] Run `20260109_human_behavior_learning.sql`
- [ ] Run `20260109_platform_infrastructure.sql`
- [ ] Run `20260109_enhanced_security_rls.sql`
- [ ] Run `20260109_archival_strategy.sql`
- [ ] Run `20260109_enhanced_persona_recording.sql`
- [ ] Run `20260109_enhanced_interaction_tracking.sql`
- [ ] Run `20260109_enhanced_test_requests.sql`
- [ ] Run `20260109_monitoring_tables.sql`

### 1.3 Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.4 Create Storage Buckets
- [ ] Run `supabase/storage/setup.sql` in SQL Editor
- [ ] Verify buckets created:
  - `persona-avatars` (public)
  - `screenshots` (public)
  - `test-recordings` (private)
  - `reports` (private)

### 1.5 Configure Archival (pg_cron)
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly archival (Sundays at 2 AM)
SELECT cron.schedule(
  'weekly-archival',
  '0 2 * * 0',
  'SELECT run_archival_maintenance(90)'
);
```
- [ ] Enable pg_cron extension
- [ ] Schedule weekly archival job
- [ ] Verify job scheduled: `SELECT * FROM cron.job;`

### 1.6 Get API Keys
From Settings > API:
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Stripe Setup (Payments)

### 2.1 Create Account
- [ ] Sign up at https://stripe.com
- [ ] Complete business verification

### 2.2 Create Products
In Stripe Dashboard > Products:

**Pro Plan**:
- [ ] Name: "HitlAI Pro"
- [ ] Price: $99/month
- [ ] Copy Price ID → `price_pro_monthly`

**Enterprise Plan**:
- [ ] Name: "HitlAI Enterprise"
- [ ] Price: Custom
- [ ] Copy Price ID → `price_enterprise_monthly`

### 2.3 Get API Keys
From Developers > API Keys:
- [ ] Copy `Secret key` → `STRIPE_SECRET_KEY`
- [ ] Copy `Publishable key` → `STRIPE_PUBLISHABLE_KEY`

### 2.4 Set Up Webhooks
From Developers > Webhooks:
- [ ] Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
- [ ] Select events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy `Signing secret` → `STRIPE_WEBHOOK_SECRET`

---

## 3. Resend Setup (Email)

### 3.1 Create Account
- [ ] Sign up at https://resend.com
- [ ] Verify domain (or use resend.dev for testing)

### 3.2 Get API Key
- [ ] Go to API Keys
- [ ] Create new key
- [ ] Copy → `RESEND_API_KEY`

### 3.3 Configure From Email
In `lib/integrations/email.ts`:
- [ ] Update `FROM_EMAIL` to your verified domain

---

## 4. Local Development

### 4.1 Install Dependencies
```bash
cd HitlAI
npm install
```

### 4.2 Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with all your API keys:
- [ ] Supabase keys
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Stripe keys
- [ ] Resend API key

### 4.3 Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4.4 Test Locally
- [ ] Create company account
- [ ] Create test request
- [ ] Verify AI test execution
- [ ] Create tester account
- [ ] Verify email notifications

---

## 5. Deploy to Vercel

### 5.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/HitlAI.git
git push -u origin main
```

### 5.2 Import to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`

### 5.3 Add Environment Variables
In Vercel project settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
```

### 5.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Visit deployment URL

---

## 6. Post-Deployment Configuration

### 6.1 Update Supabase Auth
In Supabase > Authentication > URL Configuration:
- [ ] Site URL: `https://your-app.vercel.app`
- [ ] Redirect URLs: `https://your-app.vercel.app/**`

### 6.2 Update Stripe Webhook
- [ ] Update webhook endpoint to production URL
- [ ] Test webhook delivery

### 6.3 Generate Persona Images
```bash
# Run locally or via API
npm run generate-personas
```

Or via API:
```bash
curl -X POST https://your-app.vercel.app/api/personas/generate-images \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

---

## 7. Create Default Personas

Run this in Supabase SQL Editor:

```sql
-- Already included in 20260108_initial_schema.sql
-- Verify personas exist:
SELECT * FROM personas WHERE is_default = TRUE;
```

Should see:
- senior_casual (70, low tech literacy)
- tech_savvy_millennial (28, high tech literacy)
- mobile_first_gen_z (22, medium tech literacy)
- accessibility_focused (45, medium tech literacy)

---

## 8. Testing Checklist

### Company Flow
- [ ] Sign up as company
- [ ] Verify welcome email received
- [ ] Create test request (AI-only)
- [ ] Verify test executes
- [ ] View results
- [ ] Upgrade to Pro plan
- [ ] Verify Stripe checkout works
- [ ] Create hybrid test
- [ ] Verify human testers assigned

### Tester Flow
- [ ] Sign up as tester
- [ ] Verify welcome email received
- [ ] Receive test assignment
- [ ] Verify assignment email received
- [ ] Complete test
- [ ] Submit results
- [ ] Verify company receives completion email

### Admin Tasks
- [ ] Generate persona images
- [ ] Verify images uploaded to storage
- [ ] Run behavior analysis
- [ ] Review persona refinements
- [ ] Test email notifications
- [ ] Monitor error logs

---

## 9. Monitoring & Maintenance

### 9.1 Set Up Monitoring
- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking (optional)
- [ ] Supabase logs configured

### 9.2 Database Backups
```bash
# Manual backup
supabase db dump -f backup.sql

# Automated: Supabase does daily backups automatically
```

### 9.3 Monitor Usage
```sql
-- Check test quota usage
SELECT 
  c.name,
  c.plan_type,
  c.tests_used_this_month,
  c.monthly_test_quota
FROM companies c
WHERE c.tests_used_this_month > c.monthly_test_quota * 0.8;

-- Check tester activity
SELECT 
  ht.display_name,
  ht.total_tests_completed,
  ht.average_rating,
  COUNT(hta.id) as pending_assignments
FROM human_testers ht
LEFT JOIN human_test_assignments hta ON hta.tester_id = ht.id AND hta.status = 'assigned'
GROUP BY ht.id, ht.display_name, ht.total_tests_completed, ht.average_rating;
```

---

## 10. Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secret (never in frontend)
- [ ] Stripe webhook signature verified
- [ ] CORS configured properly
- [ ] Rate limiting implemented (Vercel Edge Config)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS protection enabled (Next.js default)

---

## 11. Performance Optimization

- [ ] Enable Vercel Edge Functions for API routes
- [ ] Implement caching for personas/heuristics
- [ ] Optimize images (Next.js Image component)
- [ ] Database indexes verified
- [ ] Connection pooling configured

---

## 12. Go Live

### Pre-Launch
- [ ] All tests passing
- [ ] Error monitoring active
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Terms of Service published
- [ ] Privacy Policy published

### Launch
- [ ] Announce on social media
- [ ] Send to beta testers
- [ ] Monitor for issues
- [ ] Respond to feedback

### Post-Launch
- [ ] Monitor error rates
- [ ] Track user signups
- [ ] Collect feedback
- [ ] Iterate on features

---

## Troubleshooting

### Build Fails
```bash
# Check locally first
npm run build

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Import path issues
```

### Database Connection Issues
```bash
# Test connection
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Check RLS policies
SELECT * FROM pg_policies;
```

### Email Not Sending
- [ ] Verify Resend API key
- [ ] Check domain verification
- [ ] Review email logs in Resend dashboard

### Stripe Webhooks Failing
- [ ] Verify webhook secret
- [ ] Check endpoint URL
- [ ] Review webhook logs in Stripe dashboard

---

## Support

- **Documentation**: See `PLATFORM_OVERVIEW.md`
- **Issues**: GitHub Issues
- **Email**: support@hitlai.com

---

**Deployment Complete!** 🎉

Your HitlAI platform is now live and ready to serve companies and testers.
