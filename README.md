# HitlAI Cognitive Testing Agent

**Intellectual Property of Rickard Wig**

HitlAI is a **multi-tenant testing platform** that combines AI automation with real human testers to provide comprehensive UX testing. Built with Next.js and TypeScript, it uses specialized AI agents to:

- **Plan** comprehensive test strategies across 10 dimensions (happy path, negative testing, boundary analysis, accessibility, etc.)
- **Audit** UX with persona-weighted heuristics from Baymard Institute, Nielsen Norman Group, and WCAG
- **Execute** tests autonomously with AI or assign to human testers matching your target personas
- **Learn** from both AI failures and real human behavior to continuously improve
- **Compare** AI vs human results to validate accuracy and discover blind spots
- **Generate** photorealistic persona avatars with DALL-E 3

## 🏗️ Architecture

### Platform Components

1. **Multi-Tenant System** - Companies and human testers with role-based access
2. **AI Agents** (TypeScript):
   - **TestStrategyPlanner** (GPT-4) - Generates comprehensive test strategies
   - **VisionSpecialist** (Claude 3.5) - Persona-weighted UX auditing with guideline citations
   - **TestExecutor** - Executes multi-dimensional tests (negative, boundary, accessibility, etc.)
   - **BehaviorAnalyzer** - Extracts patterns from real user sessions
   - **PersonaImageGenerator** (DALL-E 3) - Creates photorealistic persona avatars
3. **Hybrid Testing** - AI + human testers working together
4. **Database** - Supabase (PostgreSQL + pgvector) with RLS
5. **Integrations** - Stripe (payments), Resend (email), Playwright (automation)

### Workflow

**For Companies:**
```
Create Test Request → Select Personas → Choose Test Type (AI/Human/Hybrid)
     ↓
AI Tests Execute (fast) + Human Testers Assigned (accurate)
     ↓
Compare Results → AI Learns from Discrepancies
     ↓
Generate Comprehensive Report
```

**For Testers:**
```
Create Profile → Get Matched to Tests → Execute as Persona
     ↓
Report Friction Points → Submit Results → Earn Compensation
```

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/HitlAI.git
cd HitlAI

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 2. Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Create storage buckets
# Run supabase/storage/setup.sql in Supabase SQL Editor
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Create Your First Test

1. Sign up as a company at `/company/signup`
2. Create a test request:
   - Enter URL and objective
   - Select personas (e.g., senior_casual, tech_savvy_millennial)
   - Choose test type: AI-only, human-only, or hybrid
   - Select test dimensions (happy path, negative testing, accessibility, etc.)
3. View results in dashboard

## 👥 Personas

Personas are stored in the database with AI-generated avatars. Built-in personas:

- **senior_casual** - 70yo, low tech literacy, presbyopia
- **tech_savvy_millennial** - 28yo, high tech literacy
- **mobile_first_gen_z** - 22yo, medium tech literacy
- **accessibility_focused** - 45yo, screen reader user

### Custom Personas

Create custom personas in the company dashboard:
1. Define demographics (age, tech literacy, eyesight)
2. Set attention rules and cognitive load
3. AI generates photorealistic avatar with DALL-E 3
4. Personas can be refined from real user behavior data

## 🧠 Learning System

HitlAI learns from both AI and human behavior:

1. **AI Learning** - Stores lessons from test failures in vector memory
2. **Human Behavior Learning** - Analyzes real user sessions to extract patterns
3. **Persona Refinement** - Updates personas based on actual user behavior
4. **AI vs Human Comparison** - AI learns from discrepancies with human findings

### How It Works

```typescript
// 1. Record real user sessions (anonymized)
// 2. Extract behavior patterns
const patterns = await behaviorAnalyzer.analyzeSessions(url, 10)

// 3. AI suggests persona refinements
await behaviorAnalyzer.suggestPersonaRefinements(personaId, patterns)

// 4. Human approves refinements
// 5. Future tests use improved personas
```

## 🔧 Advanced Usage

### Hybrid Testing

Combine AI speed with human accuracy:

```typescript
// Create hybrid test request
const testRequest = {
  test_type: 'hybrid',
  personas: [margaret_70_senior, alex_28_techsavvy],
  test_dimensions: ['happy_path', 'negative_testing', 'accessibility'],
  required_testers: 3
}

// AI tests run immediately (5-10 min)
// Human testers assigned and notified (24-48 hours)
// Results compared, AI learns from discrepancies
```

### Comprehensive Testing Dimensions

Test beyond happy paths:

1. **Happy Path** - Normal user flow
2. **Negative Testing** - Invalid inputs, error flows
3. **Boundary Analysis** - Edge cases, limits, empty states
4. **Accessibility** - WCAG 2.1 AA, keyboard nav, screen readers
5. **Race Conditions** - Double-click, concurrent actions
6. **Data Persistence** - Session timeout, reload behavior
7. **Exploratory** - Chaos testing, unexpected behavior

See `TESTING_STRATEGY.md` for details.

### API Integration

```typescript
// Execute test via API
const response = await fetch('/api/test-requests/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ testRequestId })
})

// Results available in company dashboard
```

## 📊 Reports

Comprehensive test reports include:

- **AI Results**: Friction points with guideline citations (Baymard, NN/g, WCAG)
- **Human Results**: Real user observations and sentiment scores
- **Comparison**: AI vs human agreement score
- **Recommendations**: Prioritized by persona impact
- **Screenshots**: Visual evidence of issues

### Example Report

```markdown
# Test Report for Margaret (70, Presbyopia, Low Tech Literacy)

**Overall**: 18/21 tests passed (85.7%)

## Critical Failures

### NEG-002: Invalid Email Format
- **Issue**: Error message "Invalid input" too vague
- **Persona Impact**: Margaret doesn't understand what's wrong
- **Guideline**: NNG-002 (Error Prevention)
- **Recommendation**: Use plain language
```

## 🛠️ Development

### Project Structure

```
HitlAI/
├── app/                 # Next.js App Router
│   ├── company/         # Company portal
│   ├── tester/          # Tester portal
│   ├── api/             # API routes
│   └── page.tsx         # Homepage
├── lib/                 # Core library
│   ├── agents/          # AI agents (TypeScript)
│   ├── orchestrator/    # Test orchestration
│   ├── memory/          # Vector memory & heuristics
│   └── integrations/    # Stripe, email, etc.
├── supabase/            # Database & storage
│   ├── migrations/      # SQL migrations
│   └── storage/         # Storage bucket setup
├── components/          # React components
└── package.json
```

### Key Technologies

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + pgvector), Row Level Security
- **AI**: OpenAI GPT-4, Anthropic Claude 3.5, DALL-E 3
- **Automation**: Playwright
- **Payments**: Stripe
- **Email**: Resend

## 🔐 Security Notes

- Never commit `.env` file
- API keys are loaded from environment only
- Playwright runs in sandboxed context
- Screenshots may contain sensitive data - review before sharing

## 📝 License

Intellectual Property of Rickard Wigrund. All rights reserved.

## 🤝 Support

For issues or questions, refer to the documentation or contact the maintainer.

---

**Built with**: Next.js • TypeScript • Supabase • OpenAI • Anthropic • Stripe • Playwright
