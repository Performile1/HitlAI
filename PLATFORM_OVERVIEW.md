# HitlAI Platform Overview

## Vision

HitlAI is a **multi-tenant testing platform** that combines AI automation with real human testers to provide comprehensive UX testing.

---

## Platform Architecture

### **Two User Types**

#### **1. Companies** 🏢
- Request tests for their websites
- Choose AI-only, human-only, or hybrid testing
- Define personas and test objectives
- Receive detailed friction reports
- Learn from AI + human insights

#### **2. Human Testers** 👥
- Create profiles with demographics
- Get matched to tests based on characteristics
- Execute manual tests following persona guidelines
- Report friction points and observations
- Earn compensation for completed tests

---

## Key Features

### **1. Hybrid Testing** 🤖 + 👤
- **AI Testing**: Fast, automated, comprehensive coverage (happy path, negative tests, accessibility, etc.)
- **Human Testing**: Real user feedback, nuanced observations, edge case discovery
- **Comparison**: AI learns from human findings, humans validate AI accuracy

### **2. Persona System** 🎭
- **Pre-built Personas**: Senior casual, tech-savvy millennial, mobile-first Gen Z, etc.
- **Custom Personas**: Companies create personas matching their target users
- **AI-Generated Avatars**: DALL-E 3 creates realistic persona images
- **Privacy-First**: Personas from human sessions are fully anonymized

### **3. Continuous Learning** 📈
- AI learns from human tester feedback
- Personas refined based on real user behavior
- Memory system stores lessons across tests
- Friction patterns identified and tracked

### **4. Comprehensive Testing Dimensions** ✅
- Happy path (normal user flow)
- Negative testing (invalid inputs, error flows)
- Boundary analysis (edge cases, limits)
- Accessibility (WCAG 2.1 AA, keyboard nav)
- Race conditions (double-click, concurrent actions)
- Data persistence (session timeout, reload)
- Exploratory (chaos, unexpected behavior)

---

## Database Schema

### **Core Tables**

#### **Companies**
```sql
- id, name, slug, logo_url
- plan_type (free, pro, enterprise)
- monthly_test_quota, tests_used_this_month
- stripe_customer_id
```

#### **Human Testers**
```sql
- id, user_id, display_name, avatar_url
- age, tech_literacy, primary_device
- total_tests_completed, average_rating
- is_available, is_verified
- hourly_rate_usd (optional)
```

#### **Test Requests**
```sql
- id, company_id, title, url, mission
- test_type (ai_only, human_only, hybrid)
- personas (JSONB array)
- test_dimensions (JSONB array)
- required_testers, tester_requirements
- status (draft, pending, in_progress, completed)
```

#### **Human Test Assignments**
```sql
- id, test_request_id, tester_id
- assigned_persona_id, instructions
- status (assigned, in_progress, completed)
- completion_time_seconds, friction_points_found
- sentiment_score, notes, recording_url
```

#### **Persona Images**
```sql
- id, persona_id, image_url
- generation_prompt, generator (dall-e-3)
- style (realistic, illustration)
```

#### **Test Result Comparisons**
```sql
- id, test_request_id
- ai_friction_points, ai_sentiment_score
- human_friction_points_avg, human_sentiment_score_avg
- agreement_score (0.0-1.0)
- ai_missed_issues, human_missed_issues
- insights (JSONB)
```

---

## Workflows

### **Company Workflow**

```
1. Sign Up → Create Company Profile
   ↓
2. Create Test Request
   - Enter URL, mission/objective
   - Select or create personas
   - Choose test type (AI/human/hybrid)
   - Select test dimensions
   ↓
3. AI Tests Execute (if applicable)
   - Autonomous testing across dimensions
   - Results available in minutes
   ↓
4. Human Tests Assigned (if applicable)
   - System matches testers to requirements
   - Testers receive notifications
   - Tests completed within 24-48 hours
   ↓
5. View Results
   - Friction points with screenshots
   - Sentiment scores
   - AI vs Human comparison
   - Recommendations
   ↓
6. Continuous Improvement
   - AI learns from human feedback
   - Personas refined from real behavior
   - Future tests more accurate
```

### **Tester Workflow**

```
1. Sign Up → Create Tester Profile
   - Age, tech literacy, devices
   - Specialties (e-commerce, accessibility, etc.)
   - Availability
   ↓
2. Get Verified
   - Complete sample test
   - Quality review
   ↓
3. Receive Test Assignments
   - Matched based on profile
   - Email/push notification
   ↓
4. Execute Test
   - Read persona guidelines
   - Navigate website as persona
   - Report friction points
   - Record session (optional)
   ↓
5. Submit Results
   - Friction points with descriptions
   - Overall sentiment
   - Notes and observations
   ↓
6. Get Paid & Rated
   - Compensation deposited
   - Company rates quality
   - Build reputation
```

---

## Persona Image Generation

### **How It Works**

1. **Persona Created** → Trigger image generation
2. **Build Prompt** from persona attributes:
   - Age, gender, ethnicity
   - Tech literacy (affects clothing/environment)
   - Accessibility needs (glasses, hearing aids)
   - Occupation (inferred from tech literacy)
3. **DALL-E 3 Generates** photorealistic avatar
4. **Upload to Supabase Storage** → `persona-avatars` bucket
5. **Store URL** in `persona_images` and `personas` tables

### **Example Prompts**

**Senior Casual (70, low tech literacy, presbyopia)**:
```
Professional headshot portrait photograph, 70-year-old person, 
senior citizen, wearing reading glasses, gray hair, warm smile 
with gentle wrinkles, casual comfortable clothing, comfortable 
home environment, natural lighting, soft focus background, 
friendly and approachable expression, high quality, professional 
photography, neutral background
```

**Tech-Savvy Millennial (28, high tech literacy)**:
```
Professional headshot portrait photograph, 28-year-old person, 
tech professional, modern professional attire, modern office or 
home office setting, natural lighting, soft focus background, 
friendly and approachable expression, high quality, professional 
photography, neutral background
```

---

## Privacy & Security

### **Human Session Recording**
- ✅ **Anonymized by default** - No PII captured
- ✅ **Consent required** - Users must opt-in
- ✅ **Sample rate** - Only record X% of sessions
- ✅ **Encrypted storage** - All data encrypted at rest
- ✅ **RLS policies** - Row-level security on all tables

### **Persona Privacy Levels**
1. **Public** - Available to all companies
2. **Company Private** - Only visible to creating company
3. **Fully Anonymized** - Generated from human sessions, no identifying info

### **Data Retention**
- Test results: 90 days (free), 1 year (pro), unlimited (enterprise)
- Session recordings: 30 days
- Persona data: Indefinite (anonymized)

---

## Pricing Model

### **For Companies**

| Plan | Price | AI Tests | Human Tests | Features |
|------|-------|----------|-------------|----------|
| **Free** | $0/mo | 10/mo | 0 | Basic personas, email support |
| **Pro** | $99/mo | 100/mo | 10/mo | Custom personas, priority support |
| **Enterprise** | Custom | Unlimited | Unlimited | Dedicated testers, custom integrations |

### **For Testers**

- **Free to join** - No cost to become a tester
- **Earn per test** - $5-$25 per test (based on complexity)
- **Bonus for quality** - High ratings = higher rates
- **Flexible schedule** - Work when you want

---

## Technology Stack

### **Frontend**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- Lucide icons

### **Backend**
- Supabase (PostgreSQL + pgvector)
- Row Level Security (RLS)
- Edge Functions
- Realtime subscriptions

### **AI/ML**
- OpenAI GPT-4 (test planning, analysis)
- Anthropic Claude 3.5 (UX auditing)
- DALL-E 3 (persona avatars)
- Sentence Transformers (embeddings)

### **Automation**
- Playwright (web testing)
- Appium (mobile testing - future)

### **Infrastructure**
- Vercel (hosting)
- Supabase Storage (screenshots, avatars)
- Stripe (payments)

---

## Roadmap

### **Phase 1: MVP** ✅ (Current)
- Company signup and test creation
- AI-only testing
- Basic personas
- Friction point reporting

### **Phase 2: Human Testing** 🚧 (In Progress)
- Tester signup and profiles
- Test assignment system
- Human test execution
- AI vs Human comparison

### **Phase 3: Learning Loop** 📅 (Next)
- Persona refinement from human sessions
- Behavior pattern extraction
- Automated persona generation
- Continuous improvement

### **Phase 4: Enterprise** 📅 (Future)
- White-label deployments
- Custom integrations (Jira, Slack)
- Dedicated tester pools
- Advanced analytics

---

## Getting Started

### **As a Company**
1. Visit [hitlai.com](https://hitlai.com)
2. Click "Request Testing"
3. Sign up with email
4. Create your first test
5. View results in dashboard

### **As a Tester**
1. Visit [hitlai.com](https://hitlai.com)
2. Click "Become a Tester"
3. Create profile
4. Complete verification test
5. Start receiving assignments

---

## Support

- **Documentation**: [docs.hitlai.com](https://docs.hitlai.com)
- **Email**: support@hitlai.com
- **Discord**: [discord.gg/hitlai](https://discord.gg/hitlai)
- **Status**: [status.hitlai.com](https://status.hitlai.com)

---

**Built with ❤️ by Rickard Wig**
