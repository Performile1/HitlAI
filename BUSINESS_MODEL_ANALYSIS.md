# HitlAI Business Model & Platform Analysis

## Executive Summary
This document addresses critical business model questions around pricing, tester management, ratings, and platform commission structure.

---

## 1. PRICING MODEL ANALYSIS

### Current Model Issues
**Problem:** Monthly subscription doesn't match usage patterns
- Most companies need testing sporadically (pre-launch, major updates, quarterly audits)
- Monthly recurring charges create friction for infrequent users
- Companies may cancel between testing cycles

### Recommended Pricing Structure

#### **Pay-Per-Test Model** (Primary)
```
AI Test: $5 per test
Human Test: $25 per test
Bulk Discounts:
  - 50+ tests: 10% off
  - 100+ tests: 20% off
  - 500+ tests: 30% off
```

#### **Credit Packages** (Better than monthly)
```
Starter Pack: $99 → 25 credits (1 credit = 1 AI test, 5 credits = 1 human test)
Growth Pack: $449 → 120 credits (10% bonus)
Enterprise Pack: $1,999 → 600 credits (20% bonus)
```
- Credits never expire
- Companies buy when they need testing
- Encourages larger purchases with bonuses

#### **Optional Monthly Plans** (For high-volume users)
```
Free Tier:
  - 10 AI tests/month
  - $0/month
  - Email support
  - Basic personas

Pro Tier:
  - 100 AI tests/month
  - 10 human tests/month
  - $299/month (save 40% vs pay-per-test)
  - Custom personas
  - Priority support

Enterprise Tier:
  - Unlimited AI tests
  - 50 human tests/month
  - Custom pricing
  - Dedicated testers
  - Custom integrations
  - 24/7 support
```

### Recommendation
**Hybrid Model:**
- Default to pay-per-test/credit packages
- Offer monthly plans for companies that test regularly
- Let companies switch between models freely

---

## 2. HITLAI COMMISSION STRUCTURE

### Current Schema
From `platform_settings`:
- `human_test_price`: $25.00
- `platform_fee_percent`: 20%

### Recommended Commission Model

#### **Transparent Markup**
```
Human Tester Sets Rate: $20/test
HitlAI Platform Fee: 25% → $5
Company Pays: $25/test
```

**Benefits:**
- Testers see their actual earnings upfront
- Transparent pricing builds trust
- Industry-standard marketplace fee (20-30%)
- Covers platform costs: payment processing, support, infrastructure

#### **Tiered Commission (Volume-based)**
```
Tester Tier          | Tests Completed | Platform Fee | Tester Keeps
---------------------|-----------------|--------------|-------------
New Tester           | 0-50            | 30%          | 70%
Verified Tester      | 51-200          | 25%          | 75%
Expert Tester        | 201-500         | 20%          | 80%
Master Tester        | 500+            | 15%          | 85%
```

**Benefits:**
- Incentivizes tester retention
- Rewards high-quality, experienced testers
- Competitive with other testing platforms

### Payment Flow
```
1. Company pays $25 for human test
2. Test completed and approved
3. HitlAI takes $5 platform fee (20%)
4. Tester receives $20
5. Payout via Stripe Connect, PayPal, or equity
```

---

## 3. TESTER PROFILE SCHEMA ENHANCEMENTS

### Current Fields (from `human_testers` table)
```sql
- display_name
- bio
- avatar_url
- age
- tech_literacy (low, medium, high)
- primary_device (desktop, mobile, tablet)
- location_country
- languages[]
- total_tests_completed
- average_rating
- specialties[]
- is_available
- hourly_rate_usd
- is_verified
```

### MISSING CRITICAL FIELDS

#### **Registration Fields** (Required at signup)
```sql
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS:
  -- Identity
  email TEXT NOT NULL,
  phone_number TEXT,
  
  -- Demographics (for persona matching)
  gender TEXT, -- male, female, non-binary, prefer_not_to_say
  occupation TEXT,
  education_level TEXT, -- high_school, bachelors, masters, phd
  
  -- Testing Experience
  years_of_testing_experience INT DEFAULT 0,
  previous_platforms TEXT[], -- ['usertesting', 'userlytics', 'trymyui']
  
  -- Preferences
  preferred_test_types TEXT[], -- ['ecommerce', 'saas', 'mobile_apps', 'accessibility']
  preferred_industries TEXT[], -- ['fintech', 'healthcare', 'education']
  min_test_duration_minutes INT DEFAULT 10,
  max_test_duration_minutes INT DEFAULT 60,
  
  -- Availability
  timezone TEXT,
  available_hours JSONB, -- {"monday": ["9-12", "14-18"], "tuesday": ["9-17"]}
  max_tests_per_week INT DEFAULT 10,
  
  -- Payment
  payment_method TEXT, -- stripe, paypal, equity, hybrid
  stripe_account_id TEXT,
  paypal_email TEXT,
  tax_id TEXT, -- for 1099 contractors
  
  -- Verification
  id_verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  background_check_status TEXT DEFAULT 'not_required',
  nda_signed BOOLEAN DEFAULT FALSE,
  nda_signed_at TIMESTAMPTZ,
```

#### **Profile Fields** (Editable after registration)
```sql
  -- Editable
  - display_name ✓
  - bio ✓
  - avatar_url ✓
  - specialties[] ✓
  - is_available ✓
  - hourly_rate_usd ✓
  - available_hours ✓
  - max_tests_per_week ✓
  - preferred_test_types[] ✓
  - preferred_industries[] ✓
  
  -- Non-editable (require verification)
  - age (can update with ID verification)
  - location_country (can update with proof)
  - languages[] (can add with proficiency test)
  - education_level (can update with proof)
```

---

## 4. TEST HISTORY & CATEGORIZATION TRACKING

### New Table: `tester_test_history`
```sql
CREATE TABLE tester_test_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  test_assignment_id UUID REFERENCES human_test_assignments(id),
  
  -- Test Details
  test_category TEXT NOT NULL, -- ecommerce, saas, mobile, accessibility, etc.
  test_type TEXT NOT NULL, -- usability, accessibility, functional, exploratory
  industry TEXT, -- fintech, healthcare, education, etc.
  
  -- Performance
  completion_time_minutes INT,
  issues_found INT DEFAULT 0,
  quality_score FLOAT, -- 0-100 calculated by AI
  
  -- Ratings
  company_rating INT, -- 1-5 stars from company
  company_feedback TEXT,
  
  -- Earnings
  amount_earned_usd DECIMAL(10,2),
  payment_method TEXT, -- cash, equity, hybrid
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tester_history_tester ON tester_test_history(tester_id);
CREATE INDEX idx_tester_history_category ON tester_test_history(test_category);
CREATE INDEX idx_tester_history_completed ON tester_test_history(completed_at DESC);
```

### Analytics Views
```sql
-- Tester expertise by category
CREATE VIEW tester_category_expertise AS
SELECT 
  tester_id,
  test_category,
  COUNT(*) as tests_completed,
  AVG(quality_score) as avg_quality,
  AVG(company_rating) as avg_rating,
  SUM(issues_found) as total_issues_found
FROM tester_test_history
GROUP BY tester_id, test_category;

-- Tester recent performance
CREATE VIEW tester_recent_performance AS
SELECT 
  tester_id,
  COUNT(*) as tests_last_30_days,
  AVG(quality_score) as avg_quality_30d,
  AVG(company_rating) as avg_rating_30d
FROM tester_test_history
WHERE completed_at > NOW() - INTERVAL '30 days'
GROUP BY tester_id;
```

---

## 5. RATING SYSTEM DESIGN

### A. Tester Ratings (by Companies)

#### **Per-Test Rating**
```sql
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS:
  -- Detailed ratings
  communication_rating INT, -- 1-5
  quality_rating INT, -- 1-5
  timeliness_rating INT, -- 1-5
  overall_rating INT, -- 1-5 (average of above)
  would_work_again BOOLEAN,
  
  -- Feedback
  company_feedback TEXT,
  internal_notes TEXT, -- private notes for company
  
  -- Flags
  flagged_for_review BOOLEAN DEFAULT FALSE,
  flag_reason TEXT
```

#### **Aggregate Tester Rating**
```sql
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS:
  -- Overall ratings
  average_rating FLOAT DEFAULT 0.0, -- existing
  total_ratings INT DEFAULT 0,
  
  -- Detailed averages
  avg_communication_rating FLOAT DEFAULT 0.0,
  avg_quality_rating FLOAT DEFAULT 0.0,
  avg_timeliness_rating FLOAT DEFAULT 0.0,
  
  -- Reputation
  positive_feedback_count INT DEFAULT 0,
  negative_feedback_count INT DEFAULT 0,
  would_work_again_percent FLOAT DEFAULT 0.0,
  
  -- Badges
  badges TEXT[], -- ['top_rated', 'fast_responder', 'accessibility_expert']
```

#### **Company-Specific Tester Rating**
```sql
CREATE TABLE company_tester_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  
  -- Aggregate ratings from this company
  tests_completed INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0.0,
  last_worked_together TIMESTAMPTZ,
  
  -- Preferences
  is_preferred_tester BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, tester_id)
);
```

### B. AI Persona Ratings

#### **Default Rating: 90%**
**Rationale:**
- 90% is reasonable for unrated AI personas
- High enough to inspire confidence
- Low enough to show room for improvement
- Industry standard for "good" AI performance

**Alternative: No rating until tested**
- Show "New - Not Yet Rated" badge
- First 10 tests are "calibration period"
- Rating appears after sufficient data

#### **AI Persona Rating Schema**
```sql
CREATE TABLE ai_persona_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  
  -- Performance Metrics
  total_tests_run INT DEFAULT 0,
  accuracy_score FLOAT DEFAULT 0.90, -- default 90%
  
  -- Comparison to Humans
  agreement_with_humans_percent FLOAT,
  false_positive_rate FLOAT,
  false_negative_rate FLOAT,
  
  -- Quality Metrics
  avg_issues_found_per_test FLOAT,
  avg_test_duration_seconds INT,
  consistency_score FLOAT, -- how consistent are results
  
  -- User Feedback
  company_satisfaction_score FLOAT,
  total_company_ratings INT DEFAULT 0,
  
  -- Confidence
  confidence_level TEXT DEFAULT 'medium', -- low, medium, high
  needs_more_training BOOLEAN DEFAULT FALSE,
  last_retrained_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(persona_id)
);
```

#### **Per-Test AI Rating**
```sql
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS:
  -- AI Performance
  ai_confidence_score FLOAT, -- 0-1 how confident AI was
  human_validation_score FLOAT, -- if validated by human
  accuracy_rating FLOAT, -- calculated post-validation
  
  -- Company feedback on AI
  company_ai_rating INT, -- 1-5 stars
  company_ai_feedback TEXT,
  ai_was_helpful BOOLEAN
```

### C. Overall Test Rating (All Testers in a Test Request)

#### **Aggregate Test Request Rating**
```sql
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS:
  -- Overall satisfaction
  overall_satisfaction_rating INT, -- 1-5 stars
  overall_feedback TEXT,
  
  -- Tester performance
  avg_tester_rating FLOAT,
  num_testers_rated INT,
  
  -- AI performance
  avg_ai_rating FLOAT,
  ai_accuracy_score FLOAT,
  
  -- Would recommend
  would_use_hitlai_again BOOLEAN,
  nps_score INT, -- Net Promoter Score -100 to 100
  
  rated_at TIMESTAMPTZ
```

---

## 6. ADDITIONAL RECOMMENDATIONS

### From Tester Perspective
**What Testers Need:**
1. **Clear earnings breakdown** - Show base rate + platform fee upfront
2. **Test preview** - See test details before accepting
3. **Skill-based matching** - Get tests that match their expertise
4. **Performance dashboard** - Track ratings, earnings, badges
5. **Payment flexibility** - Choose cash, equity, or hybrid
6. **Fair dispute resolution** - Appeal unfair ratings
7. **Growth path** - Clear path to higher tiers and lower fees

### From Company Perspective
**What Companies Need:**
1. **Tester quality filters** - Filter by rating, experience, specialty
2. **Preferred tester list** - Save and reuse good testers
3. **Bulk testing discounts** - Encourage larger test batches
4. **Test templates** - Reuse common test scenarios
5. **Results comparison** - AI vs Human side-by-side
6. **ROI tracking** - Show value of issues found
7. **Flexible pricing** - Pay-per-test or monthly plans

### From HitlAI Platform Perspective
**What HitlAI Needs:**
1. **Quality control** - Flag low-quality testers and tests
2. **Fraud detection** - Prevent fake tests and ratings
3. **Tester training** - Onboarding and skill development
4. **AI improvement loop** - Use human tests to train AI
5. **Payment processing** - Reliable payouts to testers
6. **Customer support** - Handle disputes and issues
7. **Analytics dashboard** - Track platform health metrics

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1: Critical (Immediate)
1. ✅ Add tester profile fields (registration + editable)
2. ✅ Implement per-test rating system
3. ✅ Create test history tracking
4. ✅ Set up commission structure (20-25%)
5. ✅ Add AI persona default rating (90%)

### Phase 2: Important (Next Sprint)
1. Create aggregate rating calculations
2. Build tester performance dashboard
3. Implement company-specific tester ratings
4. Add test category tracking
5. Create pricing calculator for companies

### Phase 3: Enhancement (Future)
1. Tiered commission based on tester performance
2. Tester badges and achievements
3. Advanced analytics and insights
4. Dispute resolution system
5. Tester training and certification

---

## 8. PRICING COMPARISON (Industry Benchmark)

### Competitor Analysis
```
UserTesting: $49-99 per video (human only)
Userlytics: $30-70 per test (human only)
TryMyUI: $35-50 per test (human only)
Maze: $75/month for 100 tests (AI-assisted)

HitlAI Advantage:
- AI tests at $5 (10x cheaper than competitors)
- Human tests at $25 (competitive pricing)
- Hybrid approach (unique value proposition)
- Pay-per-test flexibility (no monthly commitment)
```

### Recommended Launch Pricing
```
AI Test: $5 (loss leader to acquire customers)
Human Test: $25 (competitive + profitable)
Platform Fee: 20% (industry standard)
Tester Earnings: $20 per test (competitive)
```

---

## CONCLUSION

**Key Decisions Needed:**
1. ✅ Switch to pay-per-test + credit packages (keep monthly as option)
2. ✅ Set platform fee at 20-25% of human test price
3. ✅ Default AI persona rating to 90%
4. ✅ Track test history by category and industry
5. ✅ Implement detailed rating system (per-test + aggregate)
6. ✅ Add comprehensive tester profile fields
7. ✅ Allow companies to rate individual testers and overall test experience

**Next Steps:**
1. Create database migration with new fields
2. Update tester registration flow
3. Build rating UI components
4. Implement pricing calculator
5. Create tester performance dashboard
