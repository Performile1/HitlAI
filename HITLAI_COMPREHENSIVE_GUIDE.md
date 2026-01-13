# HitlAI - Comprehensive Platform Guide

**Version 1.0 | January 2026**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Model](#business-model)
3. [Core Value Proposition](#core-value-proposition)
4. [Platform Architecture](#platform-architecture)
5. [User Types & Workflows](#user-types--workflows)
6. [AI Training & Revenue Sharing](#ai-training--revenue-sharing)
7. [Rating & Quality Control](#rating--quality-control)
8. [Pricing & Economics](#pricing--economics)
9. [Admin Controls](#admin-controls)
10. [Technical Implementation](#technical-implementation)
11. [Legal & Compliance](#legal--compliance)
12. [Roadmap & Future Features](#roadmap--future-features)

---

## Executive Summary

**HitlAI** is a Human-in-the-Loop AI testing platform that combines the speed and cost-efficiency of AI testing with the emotional intelligence and contextual understanding of human testers.

### Key Innovation
Human testers train AI personas through their testing behavior. As AI personas become more accurate, they handle routine testing at lower costs while human testers earn passive income from the AI they trained.

### Market Position
- **For Companies**: Flexible testing options (AI-only, Human-only, or Mixed) with transparent pricing
- **For Testers**: Active income ($20/test) + Passive income (revenue share from AI they trained)
- **For Platform**: Sustainable growth model where quality improves over time while costs decrease

---

## Business Model

### Revenue Streams

#### 1. Testing Services
- **AI Testing**: $5 per test
- **Human Testing**: $25 per test
- **Mixed Testing**: Variable based on ratio

#### 2. Credit Packages
Companies purchase credits in advance:
- **Starter Pack**: 100 credits ($500) - 20% AI, 80% Human
- **Growth Pack**: 500 credits ($2,000) - 50% AI, 50% Human
- **Enterprise Pack**: Custom pricing and ratios

#### 3. Platform Fees
- Human testers pay platform fee based on tier:
  - **Beginner**: 30% platform fee
  - **Intermediate**: 25% platform fee
  - **Expert**: 20% platform fee
  - **Master**: 15% platform fee

### Cost Structure

#### Human Test ($25)
- Tester receives: $17.50 (70% for Expert tier)
- Platform keeps: $7.50 (30%)

#### AI Test ($5)
- AI operational cost: ~$0.50
- Revenue sharing pool: $0.50 (10% to trainers)
- Platform keeps: $4.00 (80%)

---

## Core Value Proposition

### For Companies

**Problem Solved**: Traditional testing is either expensive (human-only) or lacks emotional context (AI-only).

**HitlAI Solution**:
1. **Flexibility**: Choose your mix of AI/Human testing
2. **Cost Efficiency**: AI testing at $5/test vs $25/test for humans
3. **Quality Assurance**: AI trained on real human behavior
4. **Scalability**: Run hundreds of AI tests simultaneously
5. **Emotional Insights**: Human testers catch UX issues AI misses

**Use Cases**:
- **Regression Testing**: AI-only for speed and cost
- **New Feature Launch**: Mixed testing for comprehensive coverage
- **Critical User Flows**: Human-only for emotional feedback
- **Accessibility Testing**: Specific human personas (seniors, low tech literacy)

### For Human Testers

**Problem Solved**: Traditional testing platforms offer one-time payments with no long-term value.

**HitlAI Solution**:
1. **Active Income**: $20 per test (after platform fee)
2. **Passive Income**: Earn forever from AI you trained
3. **Career Growth**: Tier system with better pay and more AI revenue
4. **Skill Development**: Build portfolio and improve ratings
5. **Flexible Work**: Test on your schedule

**Revenue Example**:
- Complete 60 tests training an AI persona (60% contribution)
- Earn $1,200 upfront ($20 × 60 tests)
- AI persona runs 1,000 tests/month
- Earn $300/month passive income (60% of $0.50 × 1,000 tests)
- **Total Year 1**: $1,200 + $3,600 = $4,800 from one AI persona

### For AI Personas

**Problem Solved**: Generic AI testing lacks context and produces false positives.

**HitlAI Solution**:
1. **Trained on Real Behavior**: Learn from actual human testers
2. **Persona-Specific**: Senior users, mobile-first users, low tech literacy
3. **Continuous Improvement**: Every human test improves AI accuracy
4. **Quality Metrics**: Accuracy scores, confidence levels, retraining triggers

---

## Platform Architecture

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend**:
- Supabase (PostgreSQL + Auth + RLS)
- Edge Functions (Deno)
- Real-time subscriptions

**AI/ML**:
- OpenAI GPT-4 for persona simulation
- Custom training pipeline for behavior learning
- Accuracy scoring and confidence metrics

**Deployment**:
- Vercel (Frontend)
- Supabase Cloud (Database)
- GitHub (Version Control)

### Database Schema

#### Core Tables
- `companies` - Company accounts and billing
- `human_testers` - Tester profiles and earnings
- `personas` - AI persona definitions
- `test_requests` - Company test requests
- `test_runs` - Individual test executions
- `platform_settings` - Global configuration

#### Rating & Quality
- `company_tester_ratings` - Company ratings of testers
- `ai_persona_ratings` - AI performance metrics
- `tester_test_history` - Historical test data
- `admin_action_log` - Flagging and disabling actions

#### Revenue Sharing
- `ai_training_contributions` - Trainer contribution tracking
- `ai_revenue_transactions` - Individual revenue payments
- `revenue_sharing_pool` - Global pool management
- `revenue_sharing_terms` - Terms versioning
- `tester_terms_acceptance` - Legal compliance

---

## User Types & Workflows

### 1. Companies

#### Signup & Onboarding
1. Create account at `/company/signup`
2. Choose plan (Starter/Growth/Enterprise)
3. Purchase credits
4. Access dashboard at `/company/dashboard`

#### Creating a Test Request
1. Navigate to `/company/tests/new`
2. Enter website URL
3. Define test objective
4. Select testing ratio (AI/Human mix)
5. Choose target personas
6. Submit request

#### Reviewing Results
1. View test results at `/company/tests/[id]`
2. See friction points, sentiment scores, recommendations
3. Rate testers at `/company/tests/[id]/rate`
4. Download reports

### 2. Human Testers

#### Signup & Onboarding
1. Create account at `/tester/signup`
2. Complete profile (age, occupation, tech literacy, devices)
3. Set availability and preferences
4. Access dashboard at `/tester/dashboard`

#### Completing Tests
1. View available tests on dashboard
2. Accept test matching profile
3. Complete test and provide feedback
4. Submit results
5. Earn $20 (minus platform fee based on tier)

#### Earning Passive Income
1. Tests automatically train AI personas
2. Contribution weight calculated (your tests / total tests)
3. When AI runs test, revenue distributed proportionally
4. View earnings at `/tester/performance`

#### Tier Progression
- **Beginner** (0-9 tests): 30% platform fee
- **Intermediate** (10-49 tests): 25% platform fee
- **Expert** (50-199 tests): 20% platform fee
- **Master** (200+ tests): 15% platform fee

### 3. Admin

#### Access
- Login at `/admin/login`
- Restricted to admin role users

#### Admin Pages

**Digital Twins** (`/admin/digital-twins`)
- View all AI persona performance
- Accuracy scores, confidence levels
- Training data statistics
- Flagged personas for retraining

**Settings** (`/admin/settings`)
- Configure AI/Human test ratios
- Set pricing (AI test price, human test price)
- Configure platform fees
- Enable/disable HitlAI-funded tests
- Set rating thresholds for flagging/disabling
- Configure revenue sharing percentages
- Update terms and conditions

**Flagged Testers** (`/admin/flagged-testers`)
- View all flagged human and AI testers
- Filter by type, status
- Manual enable/disable controls
- View flagging reasons and history

**The Forge** (`/admin/forge`)
- AI Persona Patching Engine
- Review suggested persona improvements
- Approve or reject AI training patches
- View current vs proposed system prompts

**Disputes** (`/admin/disputes`)
- Handle tester/company disputes
- Review evidence and make decisions
- Manage refunds and penalties

---

## AI Training & Revenue Sharing

### How AI Training Works

#### 1. Human Tests Train AI
- Human tester completes test
- Test data (clicks, navigation, feedback) stored
- AI persona learns from behavior patterns
- Contribution weight calculated

#### 2. Contribution Weight Formula
```
Contribution Weight = (Tester's Training Tests) / (Total Training Tests for Persona)
```

**Example**:
- Tester A: 60 training tests
- Tester B: 40 training tests
- Total: 100 training tests
- Tester A weight: 60/100 = 0.60 (60%)
- Tester B weight: 40/100 = 0.40 (40%)

#### 3. Revenue Distribution
When AI persona runs a test:
1. AI test earns $5
2. 10% ($0.50) goes to revenue sharing pool
3. Distributed to trainers by contribution weight:
   - Tester A: $0.50 × 0.60 = $0.30
   - Tester B: $0.50 × 0.40 = $0.20

### Revenue Sharing Configuration

**Admin-Configurable Settings**:
- `ai_revenue_sharing_enabled` (default: TRUE)
- `ai_revenue_pool_percent` (default: 50%) - % of total AI earnings for pool
- `trainer_share_per_ai_test` (default: 10%) - % of each AI test for trainers
- `min_training_tests_for_share` (default: 10) - Minimum tests to qualify

**Example Scenarios**:

**Conservative (5% per test)**:
- AI test: $5
- Trainer share: $0.25
- Platform keeps: $4.75

**Standard (10% per test)**:
- AI test: $5
- Trainer share: $0.50
- Platform keeps: $4.50

**Generous (20% per test)**:
- AI test: $5
- Trainer share: $1.00
- Platform keeps: $4.00

### Tester Earnings Tracking

**Fields on `human_testers` table**:
- `total_earnings_usd` - Total from human testing
- `total_ai_training_earnings` - Total from AI revenue sharing
- `ai_personas_trained` - Number of AI personas trained
- `last_ai_payout_at` - Last revenue share payment

**Auto-updated via triggers** when:
- Human test completed
- AI test runs and revenue distributed
- Contribution weight recalculated

---

## Rating & Quality Control

### Human Tester Rating System

#### Rating Categories
Companies rate testers on:
1. **Overall Quality** (1-5 stars)
2. **Communication** (1-5 stars)
3. **Attention to Detail** (1-5 stars)
4. **Timeliness** (1-5 stars)
5. **Would Work Again** (Yes/No)

#### Automatic Actions

**Flagging Thresholds** (Admin Configurable):
- Default: Rating drops below **3.5/5.0**
- Action: 🚩 Flagged for review
- Minimum: 5 ratings required

**Auto-Disable Thresholds** (Admin Configurable):
- Default: Rating drops below **2.5/5.0**
- Action: ❌ Auto-disabled (can't accept tests)
- Minimum: 5 ratings required

**Database Tracking**:
- `is_flagged` - Boolean flag
- `flagged_at` - Timestamp
- `flag_reason` - Explanation
- `auto_disabled` - Boolean
- `disabled_at` - Timestamp
- `disabled_reason` - Explanation

### AI Tester Rating System

#### Performance Metrics
1. **Accuracy Score** (0.0 - 1.0)
2. **Confidence Level** (0.0 - 1.0)
3. **Total Tests Run**
4. **Company Satisfaction Score**
5. **Needs More Training** (Boolean)

#### Automatic Actions

**Flagging Thresholds** (Admin Configurable):
- Default: Accuracy drops below **75%**
- Action: 🚩 Flagged for retraining
- Minimum: 5 tests required

**Auto-Disable Thresholds** (Admin Configurable):
- Default: Accuracy drops below **60%**
- Action: ❌ Auto-disabled (removed from defaults)
- Minimum: 5 tests required

**Database Tracking**:
- Same fields as human testers
- Plus: `needs_more_training` flag
- Persona removed from `is_default` when disabled

### Admin Monitoring

**Views Available**:
```sql
-- All flagged testers (human + AI)
SELECT * FROM all_flagged_testers;

-- Human testers only
SELECT * FROM flagged_human_testers;

-- AI testers only
SELECT * FROM flagged_ai_testers;

-- Admin action history
SELECT * FROM admin_action_log;
```

**Admin Actions**:
- View flagged testers dashboard
- Manual enable/disable
- Adjust thresholds
- Review flagging history
- Export reports

---

## Pricing & Economics

### Company Pricing

#### Pay-Per-Test
- **AI Test**: $5
- **Human Test**: $25
- **Mixed Test**: Calculated based on ratio

#### Credit Packages

**Starter Pack** - $500
- 100 credits
- Recommended: 20% AI, 80% Human
- Best for: Small teams, new features

**Growth Pack** - $2,000
- 500 credits
- Recommended: 50% AI, 50% Human
- Best for: Growing companies, regular testing

**Enterprise Pack** - Custom
- Custom credit amount
- Custom AI/Human ratio
- Dedicated support
- Best for: Large organizations, high volume

### Tester Economics

#### Active Income (Per Test)
- **Test Payment**: $25
- **Platform Fee** (Expert tier): $5 (20%)
- **Tester Receives**: $20

#### Passive Income (Per AI Test)
- **AI Test Revenue**: $5
- **Revenue Share Pool**: $0.50 (10%)
- **Tester Share** (60% contribution): $0.30

#### Monthly Earnings Example
**Scenario**: Expert tester, trained 1 AI persona with 60% contribution

**Active Income**:
- 20 human tests/month × $20 = $400

**Passive Income**:
- AI runs 1,000 tests/month
- 1,000 × $0.50 = $500 pool
- Tester gets 60% = $300

**Total Monthly**: $700

### Platform Economics

#### Revenue Per Test

**Human Test** ($25):
- Tester: $17.50 (70% for Expert)
- Platform: $7.50 (30%)

**AI Test** ($5):
- AI Cost: $0.50 (10%)
- Revenue Share: $0.50 (10%)
- Platform: $4.00 (80%)

#### Margin Analysis

**100 Tests (50/50 Mix)**:
- 50 Human × $7.50 = $375
- 50 AI × $4.00 = $200
- **Total Platform Revenue**: $575

**Costs**:
- AI operational: 50 × $0.50 = $25
- Revenue sharing: 50 × $0.50 = $25
- **Total Costs**: $50

**Net Margin**: $525 (91%)

---

## Admin Controls

### Platform Settings

#### Test Configuration
- `default_ai_percentage` - Default AI test ratio
- `default_human_percentage` - Default human test ratio
- `allow_custom_ratio` - Allow companies to customize
- `min_human_tests_per_batch` - Minimum human tests required

#### Pricing
- `human_test_price` - Price per human test
- `ai_test_price` - Price per AI test
- `platform_fee_percent` - Platform fee on human tests

#### HitlAI-Funded Tests
- `hitlai_funded_enabled` - Enable free tests for startups
- `hitlai_monthly_budget` - Monthly budget for free tests
- Budget tracking and reset

#### Payment Options
- `cash_payment_enabled` - Enable cash payments
- `equity_payment_enabled` - Enable equity payments
- `hybrid_payment_enabled` - Enable hybrid payments
- `equity_shares_per_test` - Equity shares per test

#### AI Learning
- `auto_retrain_threshold` - Accuracy threshold for retraining
- `confidence_threshold` - Minimum confidence level

#### Rating Thresholds
- `human_tester_flag_threshold` - Flag human testers (default: 3.5)
- `human_tester_disable_threshold` - Disable human testers (default: 2.5)
- `ai_tester_flag_threshold` - Flag AI testers (default: 0.75)
- `ai_tester_disable_threshold` - Disable AI testers (default: 0.60)
- `min_ratings_before_action` - Minimum ratings required (default: 5)

#### Revenue Sharing
- `ai_revenue_sharing_enabled` - Enable revenue sharing
- `ai_revenue_pool_percent` - % of AI earnings for pool (default: 50%)
- `trainer_share_per_ai_test` - % per AI test for trainers (default: 10%)
- `min_training_tests_for_share` - Min tests to qualify (default: 10)
- `revenue_sharing_terms_version` - Current terms version
- `revenue_sharing_terms_updated_at` - Last terms update

### Admin Dashboards

#### Digital Twins
- View all AI personas
- Performance metrics
- Training data statistics
- Accuracy trends
- Flagged personas

#### Flagged Testers
- Filter by type (Human/AI)
- Filter by status (Flagged/Disabled)
- View statistics
- Manual enable/disable
- Export reports

#### Settings
- Update all platform settings
- View current configuration
- Save changes with confirmation
- Terms versioning

#### The Forge
- Review AI persona patches
- Compare current vs proposed prompts
- Approve/reject changes
- View patch history

---

## Technical Implementation

### Database Migrations

**Core Infrastructure**:
- `20260109_platform_infrastructure.sql` - Base tables
- `20260112_admin_controls.sql` - Admin settings

**Tester Enhancements**:
- `20260113_tester_ratings_enhancements.sql` - Rating system
- `20260113_add_total_earnings.sql` - Earnings tracking

**Quality Control**:
- `20260113_rating_monitoring_system.sql` - Auto-flagging/disabling

**Revenue Sharing**:
- `20260113_ai_training_incentives.sql` - AI training incentives

**Demo Data**:
- `20260113_demo_accounts_v2.sql` - Demo accounts

### Key Functions

#### Revenue Distribution
```sql
distribute_ai_test_revenue(persona_id, revenue, test_run_id)
```
- Calculates trainer shares
- Creates revenue transactions
- Updates trainer earnings
- Updates revenue pool

#### Contribution Weight
```sql
calculate_trainer_contribution_weight(persona_id, tester_id)
```
- Returns tester's share (0.0000 to 1.0000)
- Based on training tests completed

#### Rating Checks
```sql
check_human_tester_rating() -- Trigger function
check_ai_tester_rating() -- Trigger function
```
- Auto-flags low-rated testers
- Auto-disables very low-rated testers
- Logs actions to admin_action_log

#### Earnings Updates
```sql
update_tester_total_earnings() -- Trigger function
update_tester_ai_earnings() -- Trigger function
```
- Auto-updates tester earnings fields
- Triggered on test completion
- Triggered on revenue distribution

### Row Level Security (RLS)

**Companies**:
- Can view own company data
- Can view own test requests
- Can rate testers on their tests

**Testers**:
- Can view own tester profile
- Can view own test history
- Can view own earnings
- Can view own AI training contributions
- Can view own revenue transactions

**Admin**:
- Full access to all tables
- Can modify platform settings
- Can view all users and tests

### API Endpoints

**Company**:
- `POST /api/company/signup` - Create account
- `POST /api/company/tests` - Create test request
- `GET /api/company/tests/:id` - Get test results
- `POST /api/company/tests/:id/rate` - Rate tester

**Tester**:
- `POST /api/tester/signup` - Create account
- `GET /api/tester/tests` - Get available tests
- `POST /api/tester/tests/:id/complete` - Submit test results
- `GET /api/tester/earnings` - Get earnings summary

**Admin**:
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings
- `GET /api/admin/flagged-testers` - Get flagged testers
- `POST /api/admin/testers/:id/enable` - Enable tester
- `POST /api/admin/testers/:id/disable` - Disable tester

---

## Legal & Compliance

### Terms and Conditions

#### Revenue Sharing Terms
- Versioned in `revenue_sharing_terms` table
- Tracks effective dates
- Requires tester acceptance
- Logged with IP and timestamp

#### Terms Updates
When admin changes revenue sharing settings:
1. New terms version created
2. All testers notified
3. Must re-accept to continue earning
4. Old earnings grandfathered
5. Audit trail maintained

### Data Privacy

**User Data**:
- Encrypted at rest (Supabase)
- RLS policies enforce access control
- GDPR-compliant data handling
- Right to deletion supported

**Payment Data**:
- PCI-compliant payment processing
- No credit card storage
- Secure payment gateway integration

### Compliance Tracking

**Admin Action Log**:
- All flagging/disabling actions logged
- Includes reason and timestamp
- Performed by (admin or system)
- Audit trail for disputes

**Revenue Transactions**:
- Every payment logged
- Status tracking (pending/approved/paid/failed)
- Pool balance tracking
- Reconciliation reports

---

## Roadmap & Future Features

### Phase 1 (Current) ✅
- Core testing platform
- AI/Human hybrid testing
- Basic rating system
- Revenue sharing model
- Admin controls

### Phase 2 (Q1 2026) 🚧
- Advanced AI persona customization
- Real-time test streaming
- Video recording of tests
- Advanced analytics dashboard
- Mobile app for testers

### Phase 3 (Q2 2026) 📋
- API for third-party integrations
- Zapier/Make.com connectors
- CI/CD pipeline integration
- Automated regression testing
- A/B test comparison

### Phase 4 (Q3 2026) 🔮
- Machine learning for persona optimization
- Predictive analytics for UX issues
- Automated test case generation
- Multi-language support
- Global tester network

### Potential Features
- Browser extension for quick tests
- Slack/Discord integration
- Jira/Linear integration
- Custom reporting templates
- White-label solutions for agencies

---

## Appendix

### Demo Accounts

**Admin**:
- Email: `admin@hitlai.com`
- Password: `Demo123!`
- Access: All admin pages

**Company**:
- Email: `demo@company.com`
- Password: `Demo123!`
- Company: Demo Tech Inc.
- Plan: Pro (100 tests/month)

**Tester**:
- Email: `tester@demo.com`
- Password: `Demo123!`
- Name: Sarah Johnson
- Tier: Expert (20% platform fee)
- Stats: 127 tests, 4.7★ rating

### Key Metrics

**Platform Health**:
- Active companies
- Active testers
- Tests completed (total)
- AI accuracy average
- Revenue sharing pool balance

**Quality Metrics**:
- Average tester rating
- Average AI accuracy
- Flagged testers count
- Disabled testers count
- Dispute rate

**Financial Metrics**:
- Monthly recurring revenue
- Cost per test (AI vs Human)
- Platform margin
- Revenue sharing distributed
- Customer acquisition cost

### Support & Resources

**Documentation**:
- This comprehensive guide
- API documentation
- Migration guide
- Troubleshooting guide

**Support Channels**:
- Email: support@hitlai.com
- Discord: HitlAI Community
- GitHub: Issue tracking
- Status page: status.hitlai.com

---

## Conclusion

HitlAI represents a paradigm shift in software testing by combining the best of AI automation with human insight. The platform creates a sustainable ecosystem where:

1. **Companies** get flexible, cost-effective testing
2. **Testers** earn active + passive income
3. **AI** continuously improves from human behavior
4. **Platform** scales efficiently with quality

The revenue sharing model ensures human testers remain engaged long-term, creating a virtuous cycle of improvement and growth.

---

**Document Version**: 1.0  
**Last Updated**: January 13, 2026  
**Maintained By**: HitlAI Platform Team  
**Next Review**: February 2026
