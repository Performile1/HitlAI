# Production Deployment Guide

Complete guide for deploying HitlAI to production with Vercel + Railway + Supabase.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         VERCEL (Next.js)                │
│  - Frontend                             │
│  - API Routes                           │
│  - Orchestrator                         │
└─────────────────────────────────────────┘
                    │
                    ├─────────────────────────────┐
                    │                             │
                    ▼                             ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│   RAILWAY (Python)           │   │      SUPABASE                │
│  - Crawl4AI Service          │   │  - PostgreSQL + pgvector     │
│  - Playwright + Chromium     │   │  - Storage                   │
└──────────────────────────────┘   │  - Auth                      │
                                    └──────────────────────────────┘
```

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free)
- Supabase account (free)
- OpenAI API key
- Anthropic API key

---

## Step 1: Deploy Crawl4AI to Railway

### **1.1 Push to GitHub**

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### **1.2 Create Railway Project**

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your HitlAI repository
6. Railway will auto-detect `Dockerfile.crawl4ai`

### **1.3 Configure Service**

In Railway dashboard:
- **Service Name**: `crawl4ai`
- **Dockerfile**: `Dockerfile.crawl4ai`
- **Port**: `8001`

### **1.4 Set Environment Variables**

In Railway → Settings → Variables:
```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### **1.5 Deploy**

Railway will automatically build and deploy.

Wait for deployment to complete (~5 minutes first time).

### **1.6 Get Service URL**

In Railway → Settings → Domains:
- Click "Generate Domain"
- Copy URL (e.g., `https://crawl4ai-production-xxxx.up.railway.app`)

### **1.7 Verify**

```bash
curl https://your-railway-url.railway.app/health
```

Should return:
```json
{"status": "healthy", "service": "crawl4ai"}
```

---

## Step 2: Deploy Supabase

### **2.1 Create Project**

1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization
4. Set project name: `hitlai-production`
5. Set database password (save it!)
6. Choose region (closest to users)
7. Click "Create Project"

Wait ~2 minutes for provisioning.

### **2.2 Get Connection Details**

In Supabase → Settings → API:
- Copy `Project URL`
- Copy `anon public` key
- Copy `service_role` key (keep secret!)

### **2.3 Run Migrations**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

This runs all 10 migrations:
1. `20260108_initial_schema.sql`
2. `20260108_add_guideline_citations.sql`
3. `20260109_human_behavior_learning.sql`
4. `20260109_platform_infrastructure.sql`
5. `20260109_enhanced_security_rls.sql`
6. `20260109_archival_strategy.sql`
7. `20260109_enhanced_persona_recording.sql`
8. `20260109_enhanced_interaction_tracking.sql`
9. `20260109_enhanced_test_requests.sql`
10. `20260109_monitoring_tables.sql`

### **2.4 Enable Extensions**

In Supabase → SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### **2.5 Create Storage Buckets**

In Supabase → Storage → Create bucket:
- `persona-avatars` (public)
- `screenshots` (public)
- `test-recordings` (private)
- `reports` (private)

### **2.6 Configure pg_cron**

In SQL Editor:
```sql
-- Schedule weekly archival (Sundays at 2 AM)
SELECT cron.schedule(
  'weekly-archival',
  '0 2 * * 0',
  'SELECT run_archival_maintenance(90)'
);
```

---

## Step 3: Deploy Next.js to Vercel

### **3.1 Install Vercel CLI**

```bash
npm install -g vercel
```

### **3.2 Login**

```bash
vercel login
```

### **3.3 Configure Environment Variables**

Create `.env.production`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM APIs
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Crawl4AI Service
CRAWL4AI_SERVICE_URL=https://your-railway-url.railway.app

# App URL (will be set after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (optional)
RESEND_API_KEY=re_...
```

### **3.4 Deploy**

```bash
vercel --prod
```

Follow prompts:
- Link to existing project? **No**
- Project name? **hitlai**
- Directory? **./  (current)**
- Override settings? **No**

Vercel will:
1. Build Next.js app
2. Deploy to production
3. Give you a URL

### **3.5 Set Environment Variables in Vercel**

Go to Vercel dashboard → Your project → Settings → Environment Variables

Add all variables from `.env.production`.

### **3.6 Redeploy**

```bash
vercel --prod
```

---

## Step 4: Verify Deployment

### **4.1 Test Crawl4AI Integration**

```bash
curl -X POST https://your-app.vercel.app/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Should return crawled content.

### **4.2 Test Database Connection**

Visit: `https://your-app.vercel.app/api/health`

Should return database status.

### **4.3 Test Full Flow**

1. Create test request
2. Verify agents execute
3. Check monitoring logs
4. Verify cost tracking
5. Check friction points saved

---

## Step 5: Monitoring & Alerts

### **5.1 Railway Monitoring**

Railway dashboard shows:
- CPU usage
- Memory usage
- Request count
- Error rate

### **5.2 Vercel Analytics**

Vercel dashboard shows:
- Function execution time
- Error rate
- Traffic

### **5.3 Supabase Monitoring**

Supabase dashboard shows:
- Database size
- API requests
- Storage usage

### **5.4 Set Up Alerts** (Optional)

Use Sentry or LogRocket:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 💰 Cost Breakdown

### **Railway (Crawl4AI Service)**
- Free tier: $5 credit/month
- After free tier: ~$5-10/month
- Scales automatically

### **Vercel (Next.js)**
- Hobby: Free
- Pro: $20/month (if needed)

### **Supabase**
- Free tier: Up to 500MB database, 1GB storage
- Pro: $25/month (2GB database, 100GB storage)

### **LLM APIs**
- ~$0.80 per test (variable)
- 100 tests/month = $80
- 1000 tests/month = $800

### **Total**
- **Development**: Free
- **Production (100 tests/month)**: ~$110/month
- **Production (1000 tests/month)**: ~$860/month

---

## 🔐 Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] Supabase RLS policies enabled
- [ ] Service role key kept secret
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Circuit breaker configured

---

## 🚀 Post-Deployment

### **Update DNS** (Optional)

Point custom domain to Vercel:
1. Vercel → Settings → Domains
2. Add custom domain
3. Update DNS records

### **Enable Monitoring**

Set up:
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (UptimeRobot)

### **Test at Scale**

Run 10-20 concurrent tests to verify:
- No timeouts
- Cost tracking works
- Monitoring active
- No memory leaks

---

## 🐛 Troubleshooting

### **Crawl4AI Service Not Responding**

```bash
# Check Railway logs
railway logs

# Restart service
railway restart
```

### **Vercel Function Timeout**

Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### **Database Connection Issues**

Check Supabase connection pooling:
- Settings → Database → Connection pooling
- Use connection pooler URL in production

---

## ✅ Deployment Complete!

Your HitlAI platform is now live at:
- **Frontend**: https://your-app.vercel.app
- **Crawl4AI**: https://your-railway-url.railway.app
- **Database**: Supabase

**Next steps**:
1. Create first test
2. Monitor performance
3. Set up custom domain
4. Enable analytics
5. Start onboarding users!

🎉 **Congratulations - you're in production!**
