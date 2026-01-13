# HitlAI Pricing Model Recommendations

## Quick Summary

### Current Problem
Monthly subscriptions don't match how companies actually use testing platforms - most need tests sporadically (pre-launch, major updates, quarterly audits), not continuously.

### Recommended Solution: Hybrid Model

## 1. PRIMARY: Pay-Per-Test + Credit Packages

### Individual Test Pricing
```
AI Test: $5 per test
Human Test: $25 per test
```

### Credit Packages (Recommended)
```
Starter Pack: $99 → 25 credits
  - 1 credit = 1 AI test
  - 5 credits = 1 human test
  - No expiration
  
Growth Pack: $449 → 120 credits (10% bonus)
  - Best for 50-100 tests
  - Save $50 vs pay-per-test
  
Enterprise Pack: $1,999 → 600 credits (20% bonus)
  - Best for 200+ tests
  - Save $400 vs pay-per-test
```

**Why Credits Work:**
- Companies buy when they need testing
- No monthly commitment pressure
- Encourages larger purchases with bonuses
- Credits never expire (builds trust)
- Flexible usage (mix AI and human tests)

## 2. OPTIONAL: Monthly Plans (For High-Volume Users)

```
Free Tier: $0/month
  - 10 AI tests/month
  - Email support
  - Basic personas
  - Perfect for trying the platform

Pro Tier: $299/month
  - 100 AI tests/month
  - 10 human tests/month
  - Custom personas
  - Priority support
  - Save 40% vs pay-per-test
  - Best for: Companies testing weekly

Enterprise Tier: Custom pricing
  - Unlimited AI tests
  - 50+ human tests/month
  - Dedicated testers
  - Custom integrations
  - 24/7 support
  - Best for: Large companies with continuous testing needs
```

## 3. HitlAI Commission Structure

### Transparent Markup Model
```
Human Tester Sets Rate: $20/test
HitlAI Platform Fee: 25% → $5
Company Pays: $25/test
```

### Tiered Commission (Incentivizes Quality)
```
Tester Tier          | Tests Done | Platform Fee | Tester Keeps
---------------------|------------|--------------|-------------
New Tester           | 0-50       | 30%          | 70% ($17.50)
Verified Tester      | 51-200     | 25%          | 75% ($18.75)
Expert Tester        | 201-500    | 20%          | 80% ($20.00)
Master Tester        | 500+       | 15%          | 85% ($21.25)
```

**Benefits:**
- Rewards experienced, high-quality testers
- Reduces platform fee as testers improve
- Incentivizes tester retention
- Industry-standard marketplace fee (20-30%)

## 4. Key Fields Added to Database

### Tester Profile (Registration)
- Demographics: age, gender, education, occupation
- Testing experience: years, previous platforms
- Preferences: test types, industries, duration
- Availability: timezone, hours, max tests/week
- Payment: method, Stripe/PayPal accounts
- Verification: ID status, background check, NDA

### Rating System
- **Per-Test Ratings:** Communication, quality, timeliness, overall (1-5 stars)
- **Aggregate Ratings:** Average across all tests, would-work-again %
- **Company-Specific:** Track preferred testers, blocked testers
- **AI Persona Ratings:** Default 90%, updated based on validation

### Test History
- Track by category (ecommerce, SaaS, mobile, accessibility)
- Track by industry (fintech, healthcare, education)
- Performance metrics (quality score, issues found)
- Earnings per test

## 5. Default AI Persona Rating: 90%

**Rationale:**
- High enough to inspire confidence
- Low enough to show room for improvement
- Industry standard for "good" AI performance
- Updated based on human validation

**Alternative:** Show "New - Not Yet Rated" until 10+ tests completed

## 6. What Companies Can Rate

### Individual Tester (per test)
- Communication: 1-5 stars
- Quality: 1-5 stars
- Timeliness: 1-5 stars
- Overall: 1-5 stars
- Would work with again: Yes/No
- Written feedback

### Overall Test Experience
- Satisfaction with all testers: 1-5 stars
- AI performance: 1-5 stars
- Would use HitlAI again: Yes/No
- NPS score: -100 to 100
- Written feedback

### AI Persona Performance
- Was AI helpful: Yes/No
- AI accuracy: 1-5 stars
- Written feedback

## 7. Implementation Priority

### Phase 1 (Immediate) ✅
- Add tester profile fields
- Implement per-test rating system
- Create test history tracking
- Set up commission structure (20-25%)
- Add AI persona default rating (90%)
- **Migration created:** `20260113_tester_ratings_enhancements.sql`

### Phase 2 (Next Sprint)
- Build pricing calculator UI
- Create tester performance dashboard
- Implement credit package purchase flow
- Add company tester preference management
- Build rating submission UI

### Phase 3 (Future)
- Tester badges and achievements
- Advanced analytics dashboard
- Dispute resolution system
- Tester training and certification
- Referral program

## 8. Competitor Comparison

```
Platform          | Human Test Price | AI Tests | Model
------------------|------------------|----------|------------------
UserTesting       | $49-99          | No       | Pay-per-test
Userlytics        | $30-70          | No       | Pay-per-test
TryMyUI           | $35-50          | No       | Pay-per-test
Maze              | N/A             | Yes      | $75/month for 100
HitlAI            | $25             | $5       | Hybrid (flexible)
```

**HitlAI Advantages:**
- 10x cheaper AI tests ($5 vs competitors' human-only pricing)
- Competitive human test pricing ($25)
- Unique hybrid approach (AI + Human)
- Flexible pricing (pay-per-test OR monthly)
- No monthly commitment required

## Conclusion

**Recommended Launch Strategy:**
1. ✅ Default to credit packages (no expiration)
2. ✅ Offer monthly plans for high-volume users
3. ✅ Set platform fee at 20-25% (tiered by tester performance)
4. ✅ Default AI persona rating to 90%
5. ✅ Track comprehensive test history by category
6. ✅ Implement detailed rating system (per-test + aggregate)

**Next Steps:**
1. Run migration: `20260113_tester_ratings_enhancements.sql`
2. Update pricing page UI
3. Build tester registration flow with new fields
4. Create rating submission forms
5. Build tester performance dashboard
