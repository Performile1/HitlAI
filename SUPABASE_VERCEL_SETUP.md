# Supabase & Vercel Setup Guide
**Date**: 2026-01-11  
**Status**: Ready for Configuration

---

## 🔑 Step 1: Find Your Supabase Keys

### Where to Find Keys in Supabase Dashboard

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Navigate to Settings → API**:
   - Click the ⚙️ **Settings** icon in the left sidebar
   - Click **API** in the settings menu

3. **Copy these values**:

   ```
   Project URL: https://YOUR_PROJECT_ID.supabase.co
   ```
   
   **API Keys** section:
   - `anon` `public` key (starts with `eyJhbGc...`)
   - `service_role` `secret` key (starts with `eyJhbGc...`)

### Important Notes:
- ✅ **anon/public key** - Safe to use in frontend (public)
- ⚠️ **service_role key** - NEVER expose in frontend (server-only)
- 📋 The keys are very long (500+ characters)

---

## 🌐 Step 2: Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to your Vercel project**: https://vercel.com/YOUR_USERNAME/YOUR_PROJECT

2. **Navigate to Settings → Environment Variables**:
   - Click your project
   - Click **Settings** tab
   - Click **Environment Variables** in left menu

3. **Add each variable** (click "Add" for each):

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (your anon key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (your service role key) | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview, Development |

#### Optional Variables (can add later):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `DEEPSEEK_API_KEY` | `your-key` | Production, Preview, Development |
| `XAI_API_KEY` | `your-key` | Production, Preview, Development |
| `CRAWL4AI_SERVICE_URL` | `http://localhost:8001` (or Railway URL) | Production, Preview, Development |

4. **Click "Save"** after adding each variable

5. **Redeploy** your app for changes to take effect

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY

# Deploy
vercel --prod
```

---

## 🗄️ Step 3: Supabase Connection Type

### **Answer: Use DIRECT Connection (Recommended)**

#### Why Direct Connection?

Your HitlAI platform uses:
- ✅ **Supabase Client SDK** (`@supabase/supabase-js`)
- ✅ **Vercel Serverless Functions** (short-lived)
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Realtime subscriptions** for live updates

#### Connection Types Explained:

| Connection Type | Use Case | HitlAI Needs |
|----------------|----------|--------------|
| **Direct** | Supabase SDK, RLS, Realtime | ✅ **YES** - This is what you need |
| **Transactional** | Raw SQL, connection pooling, long-running queries | ❌ No - Not needed for your setup |

#### Your Configuration:

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

This automatically uses **Direct Connection** via Supabase's REST API.

#### When to Use Transactional (Pooler)?

Only if you were using:
- Raw PostgreSQL connections (`pg` library)
- Prisma with connection pooling
- Long-running background jobs
- High-concurrency raw SQL queries

**You don't need this for HitlAI.**

---

## 🚀 Step 4: Run Database Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Push all migrations to Supabase
supabase db push
```

This will run all 14 migration files in `supabase/migrations/`:
- ✅ `20260108_initial_schema.sql` - Core tables
- ✅ `20260109_platform_infrastructure.sql` - Platform tables
- ✅ `20260109_enhanced_security_rls.sql` - Security policies
- ✅ `20260111_rpc_functions.sql` - Database functions
- ✅ And 10 more...

### Option 2: Supabase Dashboard (Manual)

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of each migration file
3. Paste and run in order (by date)
4. Repeat for all 14 files

### Verify Migrations:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 50+ tables including:
- `test_runs`
- `friction_points`
- `memory_lessons`
- `personas`
- `action_attempts`
- `disputes`
- `persona_patches`
- And many more...

---

## 🔧 Step 5: Enable Required Extensions

Run in **Supabase SQL Editor**:

```sql
-- Vector embeddings for AI memory
CREATE EXTENSION IF NOT EXISTS vector;

-- Text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📦 Step 6: Create Storage Buckets

### In Supabase Dashboard:

1. **Go to Storage** in left sidebar
2. **Create buckets**:

   - **Bucket name**: `screenshots`
     - Public: ✅ Yes
     - File size limit: 10 MB
     - Allowed MIME types: `image/*`

   - **Bucket name**: `reports`
     - Public: ✅ Yes
     - File size limit: 50 MB
     - Allowed MIME types: `application/pdf`, `text/markdown`

   - **Bucket name**: `test-apps`
     - Public: ❌ No
     - File size limit: 500 MB
     - Allowed MIME types: `application/zip`, `application/x-zip-compressed`

### Or via SQL:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('screenshots', 'screenshots', true),
  ('reports', 'reports', true),
  ('test-apps', 'test-apps', false);

-- Set storage policies (allow authenticated users)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('screenshots', 'reports', 'test-apps'));

CREATE POLICY "Allow public reads for public buckets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('screenshots', 'reports'));
```

---

## 🧪 Step 7: Test Your Setup

### Test 1: Supabase Connection

Create `test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  // Test database connection
  const { data, error } = await supabase
    .from('personas')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('❌ Connection failed:', error)
  } else {
    console.log('✅ Connected to Supabase!')
  }
}

testConnection()
```

Run: `npx tsx test-connection.ts`

### Test 2: Check Tables

```sql
-- Run in Supabase SQL Editor
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Test 3: Check RPC Functions

```sql
-- Run in Supabase SQL Editor
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

You should see:
- `resolve_dispute_uphold`
- `resolve_dispute_overrule`
- `get_tester_trust_score`
- `calculate_payout_multiplier`
- `search_memory_lessons`

---

## 📋 Quick Reference: Your Setup

### Supabase Configuration:
- ✅ **Connection Type**: Direct (via Supabase SDK)
- ✅ **Database**: PostgreSQL with pgvector
- ✅ **Auth**: Supabase Auth (RLS enabled)
- ✅ **Storage**: 3 buckets (screenshots, reports, test-apps)
- ✅ **Extensions**: vector, pg_trgm, uuid-ossp

### Vercel Configuration:
- ✅ **Framework**: Next.js 14+ (App Router)
- ✅ **Deployment**: Serverless Functions
- ✅ **Environment**: Production + Preview
- ✅ **Region**: Auto (closest to users)

### Required API Keys:
1. ✅ Supabase URL + Anon Key (public)
2. ✅ Supabase Service Role Key (server-only)
3. ✅ OpenAI API Key (for GPT-4)
4. ✅ Anthropic API Key (for Claude 3.5)

---

## ✅ Checklist

Before deploying to Vercel:

- [ ] Found Supabase URL and keys
- [ ] Added all environment variables to Vercel
- [ ] Ran `supabase db push` (14 migrations)
- [ ] Enabled extensions (vector, pg_trgm)
- [ ] Created storage buckets (screenshots, reports, test-apps)
- [ ] Tested Supabase connection locally
- [ ] Verified tables exist (50+ tables)
- [ ] Verified RPC functions exist (5 functions)
- [ ] Ran `npm install` locally
- [ ] Tested app locally with `npm run dev`

---

## 🚨 Common Issues

### Issue: "Invalid API key"
**Fix**: Make sure you copied the FULL key (500+ characters)

### Issue: "Project not found"
**Fix**: Check your project URL matches: `https://YOUR_PROJECT_ID.supabase.co`

### Issue: "Table does not exist"
**Fix**: Run `supabase db push` to create tables

### Issue: "RPC function not found"
**Fix**: Check `20260111_rpc_functions.sql` was applied

### Issue: "Storage bucket not found"
**Fix**: Create buckets manually in Supabase Dashboard → Storage

---

## 🎯 Next Steps

1. ✅ Complete this setup guide
2. ✅ Deploy to Vercel
3. ✅ Test admin pages (`/admin/disputes`, `/admin/forge`)
4. ✅ Test tester pages (`/tester/mission-control`)
5. ✅ Create test data (companies, testers, disputes)
6. 🔮 Add Stripe for payments (later)
7. 🔮 Add email notifications (later)

---

**You're ready to deploy! 🚀**
