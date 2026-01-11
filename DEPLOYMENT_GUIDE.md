# HitlAI Cloud Deployment Guide

Complete guide to deploy HitlAI on Vercel + Supabase.

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- Accounts on:
  - [Vercel](https://vercel.com)
  - [Supabase](https://supabase.com)
  - [OpenAI](https://platform.openai.com)
  - [Anthropic](https://console.anthropic.com)

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and region
4. Set database password (save this!)
5. Wait for project to initialize (~2 minutes)

### 1.2 Run Database Migration
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

Or manually:
1. Go to SQL Editor in Supabase dashboard
2. Run migrations in order:
   - `supabase/migrations/20260108_initial_schema.sql`
   - `supabase/migrations/20260108_add_guideline_citations.sql`
   - `supabase/migrations/20260109_human_behavior_learning.sql`
   - `supabase/migrations/20260111_gemini_enhancements.sql` (NEW)
   - `supabase/migrations/20260109_platform_infrastructure.sql`
   - `supabase/migrations/20260109_enhanced_security_rls.sql`
   - `supabase/migrations/20260109_archival_strategy.sql`
   - `supabase/migrations/20260109_enhanced_persona_recording.sql`
   - `supabase/migrations/20260109_enhanced_interaction_tracking.sql`
   - `supabase/migrations/20260109_enhanced_test_requests.sql`
   - `supabase/migrations/20260109_monitoring_tables.sql`

### 1.3 Enable pgvector Extension

In SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.4 Create Storage Buckets

1. Go to Storage in Supabase dashboard
2. Run `supabase/storage/setup.sql` in SQL Editor

Or manually create:
- `persona-avatars` (public) - AI-generated persona images
- `screenshots` (public) - Test screenshots
- `test-recordings` (private) - Session recordings
- `reports` (private) - Test reports

### 1.5 Configure pg_cron for Archival

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

### 1.6 Get API Keys

From Settings > API:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

---

## Step 1.7: Start Crawl4AI Service (Required)

### Using Docker (Recommended)

```bash
# Start Crawl4AI service
docker-compose up -d crawl4ai

# Verify health
curl http://localhost:8001/health
```

### Manual Setup

```bash
# Install dependencies
pip install -r requirements-crawl4ai.txt
playwright install chromium

# Start service
cd lib/crawling
python -m uvicorn crawl4aiService:app --host 0.0.0.0 --port 8001
```

Add to `.env`:
```env
CRAWL4AI_SERVICE_URL=http://localhost:8001
```

---

## Step 2: Local Development

### 2.1 Install Dependencies

```bash
cd HitlAI
npm install
```

### 2.2 Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000

OPENAI_API_KEY=sk-proj-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

### 2.3 Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/HitlAI.git
git push -u origin main
```

### 3.2 Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.3 Add Environment Variables

In Vercel project settings > Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL (your vercel URL)
OPENAI_API_KEY
ANTHROPIC_API_KEY
```

### 3.4 Deploy

Click "Deploy" - Vercel will build and deploy automatically.

---

## Step 4: Deploy Supabase Edge Functions

### 4.1 Deploy Crawl Function

```bash
supabase functions deploy crawl-page
```

### 4.2 Set Function Secrets

```bash
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set ANTHROPIC_API_KEY=your-key
```

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Supabase Auth Settings

1. Go to Authentication > URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 5.2 Configure CORS

In Supabase dashboard > Settings > API:
- Add your Vercel domain to allowed origins

### 5.3 Test Deployment

1. Visit your Vercel URL
2. Sign up for an account
3. Create a test run
4. Monitor in Supabase dashboard

---

## Step 6: Monitoring & Maintenance

### 6.1 View Logs

**Vercel Logs:**
- Go to your project > Deployments > [latest] > Functions
- View real-time logs

**Supabase Logs:**
- Go to Logs Explorer
- Filter by table/function

### 6.2 Monitor Database

```sql
-- Check test runs
SELECT status, COUNT(*) 
FROM test_runs 
GROUP BY status;

-- Check memory usage
SELECT COUNT(*), AVG(similarity) 
FROM memory_lessons;

-- View recent friction points
SELECT severity, COUNT(*) 
FROM friction_points 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY severity;
```

### 6.3 Backup Strategy

Supabase automatically backs up daily. To manual backup:

```bash
# Export database
supabase db dump -f backup.sql

# Export storage
supabase storage download --bucket screenshots --path ./backup/
```

---

## Troubleshooting

### Build Fails on Vercel

```bash
# Check build locally
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

### Edge Function Errors

```bash
# Test locally
supabase functions serve crawl-page

# View logs
supabase functions logs crawl-page
```

### Memory/Vector Search Not Working

```sql
-- Verify pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check index
SELECT * FROM pg_indexes WHERE tablename = 'memory_lessons';

-- Test vector search
SELECT * FROM match_memory_lessons(
  query_embedding := array_fill(0, ARRAY[1536])::vector,
  match_count := 5
);
```

---

## Cost Optimization

### Supabase

- **Free Tier**: 500MB database, 1GB storage, 2GB bandwidth
- **Pro ($25/mo)**: 8GB database, 100GB storage, 50GB bandwidth
- **Optimize**:
  - Archive old test runs
  - Compress screenshots
  - Use CDN for static assets

### Vercel

- **Hobby (Free)**: 100GB bandwidth, 100GB-hours functions
- **Pro ($20/mo)**: 1TB bandwidth, unlimited functions
- **Optimize**:
  - Use edge functions for static content
  - Implement caching
  - Optimize images

### LLM APIs

- **OpenAI**: ~$0.50/test (GPT-4)
- **Anthropic**: ~$0.30/test (Claude 3.5)
- **Optimize**:
  - Use GPT-3.5 for simple tasks
  - Cache common responses
  - Batch requests

---

## Scaling Considerations

### Database

- Add read replicas for high traffic
- Implement connection pooling
- Use database indexes effectively

### API Routes

- Implement rate limiting
- Use queue system for long-running tests
- Cache frequently accessed data

### Storage

- Use CDN for screenshots/reports
- Implement automatic cleanup
- Compress files before upload

---

## Security Checklist

- [ ] Environment variables set correctly
- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secret
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## Comprehensive Testing Framework

HitlAI includes a multi-dimensional testing framework that goes beyond happy path testing:

### Testing Dimensions Available

1. **Happy Path** - Normal user flows
2. **Negative Testing** - Invalid inputs, error flows
3. **Boundary Analysis** - Edge cases, limits, empty states
4. **Accessibility** - WCAG 2.1 AA compliance, keyboard nav
5. **Race Conditions** - Double-click, concurrent actions
6. **Data Persistence** - Session timeout, reload behavior
7. **Exploratory** - Chaos testing, unexpected behavior

### Key Components

- **TestStrategyPlanner** (`lib/agents/testStrategyPlanner.ts`) - Generates comprehensive test strategies
- **TestExecutor** (`lib/agents/testExecutor.ts`) - Executes multi-dimensional tests
- **HeuristicLoader** (`lib/memory/heuristicLoader.ts`) - Persona-weighted UX guidelines (Baymard, NN/g, WCAG)
- **VisionSpecialist** - Now includes guideline citations in friction points

### Database Schema Updates

The `friction_points` table now includes:
- `guideline_citation` column - References UX guidelines (e.g., BAY-001, NNG-003)

See `TESTING_STRATEGY.md` for complete documentation.

---

## Next Steps

1. **Custom Domain**: Add custom domain in Vercel settings
2. **Analytics**: Integrate Vercel Analytics or Plausible
3. **Monitoring**: Set up Sentry or LogRocket
4. **CI/CD**: Configure GitHub Actions for testing
5. **Documentation**: Add API documentation with Swagger
6. **Review Testing Strategy**: Read `TESTING_STRATEGY.md` to understand comprehensive testing capabilities

---

**Deployment Complete!** 🎉

Your HitlAI instance is now live and ready to test websites autonomously.

Visit: `https://your-app.vercel.app`
