# Vercel Environment Variables Checklist
**Complete list of all environment variables to configure**

---

## 🔑 Required Variables (Must Have)

Copy this table and fill in your actual values:

| Variable Name | Where to Find | Example Format | Notes |
|--------------|---------------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://abcdefgh.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (500+ chars) | Public key for frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (500+ chars) | **SECRET** - Server only |
| `OPENAI_API_KEY` | OpenAI Dashboard → API Keys | `sk-proj-...` | For GPT-4 calls |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | `sk-ant-...` | For Claude 3.5 calls |

---

## 📋 Optional Variables (Can Add Later)

| Variable Name | Where to Find | Example Format | When Needed |
|--------------|---------------|----------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | `https://hitlai.vercel.app` | For webhooks/callbacks |
| `DEEPSEEK_API_KEY` | DeepSeek Dashboard | `your-key` | If using DeepSeek LLM |
| `XAI_API_KEY` | X.AI Dashboard | `your-key` | If using Grok |
| `CRAWL4AI_SERVICE_URL` | Railway/Docker deployment | `https://your-app.railway.app` | For web scraping |
| `SCRAPEGRAPH_API_KEY` | ScrapeGraph Dashboard | `your-key` | Alternative scraping |
| `BROWSERLESS_API_KEY` | Browserless.io Dashboard | `your-key` | For headless browsers |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys | `sk_test_...` or `sk_live_...` | For payments |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys | `pk_test_...` or `pk_live_...` | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks | `whsec_...` | For payment webhooks |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | `re_...` | For email notifications |

---

## 🎯 How to Add in Vercel Dashboard

### Step-by-Step:

1. **Go to**: https://vercel.com/YOUR_USERNAME/YOUR_PROJECT

2. **Click**: Settings (top navigation)

3. **Click**: Environment Variables (left sidebar)

4. **For each variable**:
   - Click **"Add New"** button
   - **Name**: Copy exact name from table above (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Paste your actual key/URL
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

5. **After adding all variables**:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"

---

## ✅ Quick Copy Template

Copy this and fill in your values (DO NOT COMMIT TO GIT):

```bash
# === REQUIRED ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# === OPTIONAL (add later) ===
NEXT_PUBLIC_APP_URL=
DEEPSEEK_API_KEY=
XAI_API_KEY=
CRAWL4AI_SERVICE_URL=
SCRAPEGRAPH_API_KEY=
BROWSERLESS_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

---

## 🔍 Where to Find Each Key

### 1. Supabase Keys (3 variables)

**Location**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

- **Project URL**: Top of page under "Project URL"
- **anon key**: Under "Project API keys" → Look for badge `anon` `public`
- **service_role key**: Under "Project API keys" → Look for badge `service_role` `secret`

### 2. OpenAI Key

**Location**: https://platform.openai.com/api-keys

- Click "Create new secret key"
- Name it "HitlAI Production"
- Copy the key (starts with `sk-proj-`)

### 3. Anthropic Key

**Location**: https://console.anthropic.com/settings/keys

- Click "Create Key"
- Name it "HitlAI Production"
- Copy the key (starts with `sk-ant-`)

### 4. DeepSeek Key (Optional)

**Location**: https://platform.deepseek.com/api_keys

### 5. X.AI Key (Optional)

**Location**: https://console.x.ai/

### 6. Stripe Keys (Optional)

**Location**: https://dashboard.stripe.com/apikeys

- Use **Test keys** for development
- Use **Live keys** for production

### 7. Resend Key (Optional)

**Location**: https://resend.com/api-keys

---

## 🧪 Test Your Setup

After adding all variables, test with this command:

```bash
# In your local terminal
vercel env pull .env.local

# Check if variables are set
cat .env.local
```

Or test in Vercel deployment logs:

```typescript
// Add this to any API route temporarily
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('Supabase Anon:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('OpenAI:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing')
console.log('Anthropic:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing')
```

---

## ⚠️ Security Checklist

- [ ] Never commit `.env` files to Git
- [ ] `.env` is in `.gitignore`
- [ ] Service role key is NEVER used in frontend code
- [ ] All `NEXT_PUBLIC_*` variables are safe to expose
- [ ] Production keys are different from development keys
- [ ] Keys are stored in password manager as backup

---

## 🚨 If You Accidentally Expose a Key

1. **Immediately rotate the key**:
   - Supabase: Settings → API → Reset key
   - OpenAI: Delete old key, create new one
   - Anthropic: Revoke old key, create new one

2. **Update Vercel**:
   - Go to Environment Variables
   - Edit the exposed variable
   - Paste new key
   - Redeploy

3. **Check Git history**:
   - If committed to Git, use `git filter-branch` or BFG Repo-Cleaner
   - Force push to remote

---

## ✅ Minimum to Deploy

You only need these 5 variables to get started:

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY`
4. ✅ `OPENAI_API_KEY`
5. ✅ `ANTHROPIC_API_KEY`

Everything else can be added later as you enable features.

---

**Ready to configure! 🚀**
