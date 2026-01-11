# HitlAI Master Project Blueprint
**Owner**: Rickard Wigrund (Intellectual Property)  
**Version**: 1.0 (2026-01-11)  
**Core Concept**: A hybrid AI-Human UX testing platform where AI agents simulate personas and humans validate or dispute those simulations.

---

## 🏗️ System Architecture & Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI Engine**: 12-Agent Orchestration (Gemini 1.5 / Claude 4.5)
- **Database Moat**: pgvector for semantic search of human insights
- **Durable Execution**: Temporal-inspired workflow pattern for HITL loops

---

## 🎯 The 12-Agent Orchestration

1. **NavigationAgent** - Simulates user navigation patterns
2. **InteractionAgent** - Handles clicks, scrolls, form fills
3. **FrustrationAgent** - Detects UI friction points
4. **AccessibilityAgent** - WCAG compliance checking
5. **PerformanceAgent** - Load time and responsiveness
6. **SecurityAgent** - Basic security vulnerability detection
7. **ContentAgent** - Copy clarity and readability
8. **VisualAgent** - Design consistency and hierarchy
9. **MobileAgent** - Mobile-specific UX issues
10. **FlowAgent** - User journey optimization
11. **EmotionAgent** - Sentiment analysis of user experience
12. **CritiqueAgent** - Meta-analysis and report synthesis

---

## 🛠️ Modules & Design Systems

### 1. Company Launchpad (The "Architect")
- **Style**: FinTech Professional (Slate/Indigo)
- **Goal**: High-speed asset upload and hybrid ratio configuration
- **Critical Components**: 
  - Asset-dropzone (Web URL, .apk, .ipa upload)
  - Persona-selector (demographic targeting)
  - Hybrid-cost-slider (AI/Human ratio: $1.50 AI / $15 Human)
  - Credit-preview (real-time cost calculation)

### 2. Tester Mission Control (The "Worker")
- **Style**: Performance Gamer (Dark Mode, High Contrast)
- **Goal**: Immediate task access and trust-score gamification
- **Critical Components**: 
  - Mission-cards (available tests with rewards)
  - Trust-meter (animated ring, 0-1000 score)
  - Payout-sparklines (earnings history)
  - Dispute-missions (high-value validation tasks)

### 3. Hybrid Test Viewer (The "Lab")
- **Style**: Scientific/Analytical
- **Goal**: Synchronized video annotation and AI-ghost overlay
- **Critical Components**: 
  - Iframe-emulator (sandboxed test environment)
  - Annotation-sidebar (timestamp-linked comments)
  - Dual-track-timeline (AI predictions vs Human actions)
  - AI-ghost-overlay (shows where AI predicted clicks)

### 4. The Forge (The "Intelligence Center")
- **Style**: IDE / Developer Tool
- **Goal**: Admin-driven persona training using human evidence
- **Critical Components**: 
  - Prompt-editor (system prompt modification)
  - Similarity-search-panel (pgvector semantic search)
  - Evidence-to-logic bridge (human insights → AI patches)
  - Patch-review-diff (before/after persona comparison)

### 5. Dispute Review Hero (The "Judge's Bench")
- **Style**: Legal/Audit Interface
- **Goal**: Admin resolution of AI vs Human disputes
- **Critical Components**:
  - Side-by-side comparison (AI findings vs Human findings)
  - Evidence viewer (synchronized video playback)
  - Verdict bar (Uphold AI / Overrule AI buttons)
  - Connection lines (linking same DOM elements)

---

## ⚖️ Business Logic: Confidence Guarantee

### The Dispute Flow
1. **Company disputes AI results** → Initiates Quality Dispute
2. **System grants conditional credits** → 10x original cost (escrowed)
3. **3 High-Rated humans validate** → Agreement threshold: 70%
4. **Admin reviews evidence** → Side-by-side comparison in Dispute Review Hero
5. **Verdict**:
   - **AI Upheld**: Company pays 10x credits + $5 penalty
   - **AI Overruled**: Company gets free human report + refund + AI retraining

### Fairness Mechanisms
- **Evidence Transparency**: Side-by-side comparison proves AI correctness
- **Grace Period**: First dispute free for new companies
- **Elite Validators**: Only 750+ Trust Score testers handle disputes
- **Expert-in-the-Loop**: Human admin makes final verdict (not automated)

---

## 🕹️ Tester Experience Logic

### The Trust Engine
- **Trust Score Range**: 0-1000
- **Calculation Factors**:
  - Agreement rate with other testers (consensus)
  - Dispute validation accuracy
  - Time-on-task consistency
  - Biometric humanity score (anti-bot)

### Mission Allocation
- **Standard Tests**: All testers with Trust > 100
- **Dispute Audits**: Only testers with Trust > 750
- **Judge Tier**: Top 5% testers (Trust > 900)

### Earnings Logic
```typescript
finalPayout = (baseFee × trustMultiplier × qualityPenalty) + disputeBonus

trustMultiplier = 1 + (trustScore / 2000)  // Max +50% at 1000 score
disputeBonus = baseFee × 0.5 (if correctly overrules AI)
qualityPenalty = 0.5 (if agreement rate < 33%)
```

### The Sandbox
- Testers work in iframe/sandboxed environment
- All interactions recorded as "Action Stream" (JSON)
- Biometric tracking: mouse jitter, typing variance, focus events
- Auto-flag for admin review if humanity score < 60%

---

## 🧬 The Persona Patching Engine

### Human Evidence → AI Learning Loop
1. **Capture**: Human tester hits "I'm Confused" or struggles on element
2. **Analyze**: CritiqueAgent compares human vs AI behavior
3. **Synthesize**: Claude 4.5 generates behavioral constraint patch
4. **Admin Review**: Patch shown in Forge with diff view
5. **Deploy**: Patch appended to persona system prompt

### Patch Types
- **Individual Patch**: 1 human evidence (Status: Experimental)
- **Consensus Patch**: 3+ humans same issue (Status: Verified)
- **Persona Versioning**: Track "Human-DNA Version" (e.g., Elderly v2.4)

### The Knowledge Moat
- Store patches in `persona_patches` table
- Use pgvector for semantic similarity search
- Weight patches by consensus and validation success
- Create "Evidence Library" for each persona

---

## 🔒 Security & Anti-Gaming

### The Sentinel (Anti-Bot Detection)
```typescript
humanityScore = calculateBiometrics({
  mouseJitter: variance(mouseMovements),
  typingSpeed: variance(keystrokes),
  focusEvents: tabSwitchCount,
  interactionTiming: naturalPauses
})

if (humanityScore < 0.6) {
  flagForAdminReview()
  applyPayoutPenalty(0.5)
}
```

### The 3-Judge Rule (Consensus Engine)
- Every dispute requires 3 independent testers
- AI only overruled if 2/3 agree on same issue
- Prevents single "bad tester" from costing money
- Agreement rate tracked per tester for Trust Score

### Malware Scanning
- All .apk/.ipa uploads scanned before test assignment
- Status: 'pending' → 'clean' → 'ready_for_test'
- Options: VirusTotal API ($500/mo) or ClamAV (free)

---

## 📂 Database Entity Checklist

### Core Tables (Existing)
- ✅ `profiles` (id, role: admin|tester|company, trust_score)
- ✅ `personas` (id, name, demographic_json, system_prompt, version)
- ✅ `test_requests` (id, company_id, url, app_file_url, app_type)
- ✅ `test_runs` (id, test_request_id, status, findings)
- ✅ `human_testers` (id, profile_id, trust_score, earnings)

### Gemini Enhancements (Existing)
- ✅ `human_insights` (id, content, embedding: vector(1536), severity)
- ✅ `tester_annotations` (id, timestamp_ms, position, text, markup)
- ✅ `company_credits` (id, company_id, balance, total_spent)
- ✅ `credit_transactions` (id, company_id, amount, type)
- ✅ `shadow_test_runs` (id, ai_findings, human_findings, discrepancies)

### Confidence Guarantee (Existing)
- ✅ `test_disputes` (id, test_run_id, status, human_validation_credits)
- ✅ `dispute_resolutions` (id, dispute_id, ai_was_correct, penalty_fee)
- ✅ `admin_dispute_settings` (credit_multiplier, penalty_fee, agreement_threshold)

### Missing Tables (To Add)
- ⚠️ `disputes` (Enhanced version with escrow tracking)
- ⚠️ `persona_patches` (id, persona_id, suggested_logic, status)
- ⚠️ `ai_learning_events` (id, event_type, test_run_id, details)
- ⚠️ `biometric_scores` (id, tester_id, test_run_id, humanity_score)
- ⚠️ `consensus_validations` (id, dispute_id, tester_votes, agreement_rate)

### Schema Enhancement Needed
- ⚠️ `company_credits.conditional_balance` (escrowed credits during disputes)
- ⚠️ `disputes` table with full Gemini spec (ai_findings_json, human_findings_json)

---

## 🎨 Brand Identity & Design Tokens

### Color Palette
- **Primary**: Indigo-600 (#4F46E5)
- **Secondary**: Slate-900 (#0F172A)
- **Accent**: Emerald-500 (#10B981)
- **Friction/Error**: Rose-500 (#F43F5E)
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Slate-300 (#CBD5E1)

### Typography
- **Headings**: Inter/Sans-serif, Bold/Extrabold
- **Body**: Inter/Sans-serif, Regular/Medium
- **Code/AI**: Monospace, Slate-400

### Component Styles
- **Cards**: `rounded-lg border-slate-700 shadow-lg bg-slate-800`
- **Buttons Primary**: `bg-indigo-600 hover:bg-indigo-700 rounded-lg`
- **Buttons Accent**: `bg-emerald-500 hover:bg-emerald-600 rounded-lg`
- **Highlighted**: `bg-indigo-900/30 border-indigo-700 shadow-xl`

---

## 🔄 Durable HITL Workflow Pattern

### The Temporal-Inspired Architecture
1. **Test as Workflow**: Each test is a durable workflow that can pause/resume
2. **Signal Logic**: AI enters suspended state waiting for `HumanSubmissionSignal`
3. **Non-Deterministic Events**: Human actions stored as "Activity" logs
4. **Replay on Resume**: If worker crashes, replay history and continue

### The Ghost Replay Loop
```
Step A: AI Agent performs test (The Prediction)
Step B: Human performs test (The Truth)  
Step C: CritiqueAgent compares (Gap Analysis)
Step D: Gap Data patches AI persona (Learning)
```

### Implementation Requirements
- Supabase Edge Function: `signal-listener` (wakes suspended AI workflows)
- Action Stream capture: JSON log of clicks/scrolls/inputs
- Orphan handler: 24-hour timeout → reassign or refund
- Persona calibration: `updatePersonaFromHumanEvidence()` function

---

## 📋 Implementation Phases

### Phase 1: UI Foundations (Week 1)
- [ ] Brand Style Guide page (`/admin/style-guide`)
- [ ] Company Test Configuration Wizard (3-step flow)
- [ ] Tester Mission Control dashboard
- [ ] Basic Test Viewer (iframe sandbox)

### Phase 2: Dispute System (Week 2)
- [ ] Enhanced disputes table migration
- [ ] Dispute Review Hero component
- [ ] DisputeResolutionManager integration
- [ ] Admin verdict workflow

### Phase 3: The Forge (Week 2-3)
- [ ] Persona Patching Engine
- [ ] Evidence similarity search (pgvector)
- [ ] Patch review diff UI
- [ ] Persona versioning system

### Phase 4: Security & Quality (Week 3)
- [ ] Sentinel biometric tracking
- [ ] Consensus validation (3-judge rule)
- [ ] Payout logic with Trust multipliers
- [ ] Anti-gaming detection

### Phase 5: Durable HITL (Week 4)
- [ ] Signal listener Edge Function
- [ ] Action Stream recording
- [ ] Ghost Replay comparison
- [ ] Persona auto-calibration

---

## 🚀 Deployment Checklist

### Prerequisites
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Supabase project initialized
- [ ] All migrations run (`supabase db push`)

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CRAWL4AI_SERVICE_URL=http://localhost:8001
```

### Deployment Targets
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Crawl4AI service)
- **Database**: Supabase (managed Postgres)
- **Storage**: Supabase Storage (videos, screenshots)

### Verification Steps
1. Test AI-only run (12 agents orchestration)
2. Test human tester signup and mission view
3. Test dispute creation and resolution
4. Verify credit transactions
5. Test persona patching workflow

---

## 🎯 Success Metrics

### Technical KPIs
- AI agent success rate > 85%
- Human-AI agreement rate > 70%
- Dispute resolution time < 24 hours
- Platform uptime > 99.5%

### Business KPIs
- False dispute rate < 10%
- Tester retention > 80% (30 days)
- Company satisfaction > 4.5/5
- AI learning velocity (patches/week)

---

## 📝 Terms of Service: Confidence Guarantee Clause

### Section X: The HitlAI Confidence Guarantee & Dispute Resolution

**X.1 AI-Only Baseline**: Customer may elect AI-Only Tests. HitlAI warrants AI Agents perform testing based on assigned Persona constraints but acknowledges AI insights are probabilistic.

**X.2 Dispute Initiation**: If Customer is unsatisfied with AI-Only Test results, Customer may initiate "Quality Dispute" through Admin Dashboard within 7 business days of report delivery.

**X.3 Conditional Credit Allocation**: Upon valid dispute, HitlAI grants conditional allocation of Human Tester Credits ("Validation Credits") equivalent to 10× original AI Test cost, solely for "Validation Run" to verify disputed findings.

**X.4 Verification & The "Truth Clause"**: Validation Run conducted by minimum 3 High-Rated Human Testers. Outcome determined as:
- **(a) AI Upheld (The Payback)**: If Human Testers confirm AI's findings or fail to identify alleged issues, dispute deemed "Invalid." Customer liable for full cost of Validation Credits + Verification Surcharge of $5.00.
- **(b) AI Overruled**: If Human Testers identify critical friction points missed by AI, dispute "Valid." Validation Credits waived, Human Report provided at no cost, original AI Test fee refunded.

**X.5 Finality of Decision**: Verification results by HitlAI expert review layer are final. HitlAI reserves right to suspend Confidence Guarantee for accounts showing pattern of "Bad Faith" disputes.

---

**END OF BLUEPRINT**
