# HitlAI - Complete User Flows Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026

---

## Table of Contents

1. [Company User Flows](#company-user-flows)
2. [Tester User Flows](#tester-user-flows)
3. [Admin User Flows](#admin-user-flows)
4. [Early Adopter Flows](#early-adopter-flows)
5. [Decision Trees](#decision-trees)
6. [Error Handling Flows](#error-handling-flows)
7. [Edge Cases](#edge-cases)

---

## Company User Flows

### Flow 1: Company Signup & Onboarding

```
START
  │
  ├─→ Visit Homepage (/)
  │
  ├─→ Click "Get Started" or "Company Login"
  │
  ├─→ Navigate to /company/signup
  │
  ├─→ Fill Signup Form
  │   ├─ Company name (required)
  │   ├─ Email (required)
  │   ├─ Password (required, min 8 chars)
  │   ├─ Company size (dropdown)
  │   └─ Industry (dropdown)
  │
  ├─→ Submit Form
  │
  ├─→ [DECISION] Valid data?
  │   ├─ NO → Show validation errors → Return to form
  │   └─ YES → Continue
  │
  ├─→ Create Supabase Auth User
  │   └─ user_type: 'company'
  │
  ├─→ Insert into companies table
  │   └─ plan_type: 'free'
  │   └─ monthly_test_quota: 10
  │
  ├─→ Insert into company_members table
  │   └─ role: 'owner'
  │
  ├─→ Send verification email
  │
  ├─→ Redirect to /company/dashboard
  │
  ├─→ Show welcome banner
  │   └─ "Welcome! Start your first test"
  │
END
```

**Key Screens:**
1. `/` - Homepage with CTA
2. `/company/signup` - Signup form
3. `/company/dashboard` - Dashboard with welcome state

**Database Changes:**
- `auth.users` - New user created
- `companies` - New company record
- `company_members` - Owner membership

**Notifications:**
- Email: Verification email sent
- UI: Welcome banner on dashboard

---

### Flow 2: Request a Test

```
START (User on /company/dashboard)
  │
  ├─→ Click "New Test" button
  │
  ├─→ Navigate to /company/tests/new
  │
  ├─→ Fill Test Request Form
  │   ├─ URL (required, must be valid URL)
  │   ├─ Mission (required, min 20 chars)
  │   ├─ Persona (dropdown or custom)
  │   │   ├─ Tech-Savvy User
  │   │   ├─ Casual User
  │   │   ├─ Senior User
  │   │   ├─ Mobile-First User
  │   │   └─ Custom (opens modal)
  │   ├─ Platform (web/mobile)
  │   ├─ Platform Details (conditional)
  │   │   ├─ If web: Browser, OS, viewport
  │   │   └─ If mobile: Device, OS version
  │   ├─ Test Type (ai_only/human_only/hybrid)
  │   └─ Additional Context (optional)
  │
  ├─→ [DECISION] Check quota
  │   ├─ Quota exceeded → Show upgrade modal
  │   │   └─ "Upgrade Plan" or "Contact Sales"
  │   └─ Quota available → Continue
  │
  ├─→ Submit Form
  │
  ├─→ [DECISION] Valid data?
  │   ├─ NO → Show validation errors → Return to form
  │   └─ YES → Continue
  │
  ├─→ Insert into test_requests table
  │   └─ status: 'pending'
  │
  ├─→ Increment tests_used_this_month
  │
  ├─→ [DECISION] Test type?
  │   ├─ ai_only → Queue for AI execution
  │   ├─ human_only → Assign to tester pool
  │   └─ hybrid → Start with AI, queue human review
  │
  ├─→ Redirect to /company/tests/[id]
  │
  ├─→ Show status: "Test queued"
  │
  ├─→ [BACKGROUND] Execute test
  │   └─ Updates status in real-time
  │
  ├─→ [WHEN COMPLETE] Show notification
  │   └─ "Test completed! View results"
  │
END
```

**Key Screens:**
1. `/company/dashboard` - Dashboard with "New Test" button
2. `/company/tests/new` - Test request form
3. `/company/tests/[id]` - Test status and results

**Decision Points:**
- Quota check (upgrade prompt)
- Test type routing (AI vs human vs hybrid)
- Validation (form errors)

**Real-time Updates:**
- Status changes via Supabase subscriptions
- Progress updates during execution

---

### Flow 3: View Test Results

```
START (User on /company/tests/[id])
  │
  ├─→ Fetch test_run from database
  │
  ├─→ [DECISION] Test status?
  │   ├─ pending → Show "Queued" state
  │   ├─ running → Show progress bar
  │   ├─ hitl_paused → Show "Waiting for human review"
  │   ├─ completed → Show results
  │   └─ failed → Show error message
  │
  ├─→ [IF COMPLETED] Display Results
  │   ├─ Sentiment Score (0-1 scale)
  │   │   └─ Visual gauge with color coding
  │   ├─ Issues Found (list)
  │   │   ├─ Severity badge (critical/high/medium/low)
  │   │   ├─ Title and description
  │   │   ├─ Screenshot (if available)
  │   │   └─ Element selector
  │   ├─ Recommendations (list)
  │   │   └─ Actionable suggestions
  │   ├─ Positives (list)
  │   │   └─ What worked well
  │   └─ Final Report (markdown)
  │
  ├─→ [ACTION] Rate AI Performance
  │   ├─ 1-5 star rating
  │   ├─ Optional feedback text
  │   └─ Submit rating
  │
  ├─→ Update test_run.company_ai_rating
  │
  ├─→ [IF RATING >= 4] Capture as training data
  │   └─ Insert into ai_training_data
  │
  ├─→ Update milestone progress
  │
  ├─→ [ACTION OPTIONS]
  │   ├─ Export report (PDF/JSON)
  │   ├─ Share via link
  │   ├─ Create Jira ticket (if integrated)
  │   ├─ Request human review (if AI-only)
  │   └─ Run another test
  │
END
```

**Key Screens:**
1. `/company/tests/[id]` - Test results page with multiple states

**UI States:**
- Pending: Spinner + "Test queued"
- Running: Progress bar + current step
- Paused: "Waiting for human review" banner
- Completed: Full results display
- Failed: Error message + retry option

**Actions Available:**
- Rate AI (1-5 stars)
- Export report
- Share results
- Create ticket
- Request review
- Run new test

---

### Flow 4: Early Adopter Application (Company)

```
START
  │
  ├─→ [ENTRY POINTS]
  │   ├─ Homepage → See EarlyAdopterCard
  │   ├─ Pricing page → See early adopter section
  │   └─ Navigation → Programs dropdown
  │
  ├─→ Click "Apply Now"
  │
  ├─→ Navigate to /early-adopter
  │
  ├─→ View Program Overview
  │   ├─ Tier comparison table
  │   ├─ Benefits breakdown
  │   └─ Spots remaining counter
  │
  ├─→ Select Tier
  │   ├─ Founding Partner (25% discount)
  │   ├─ Early Adopter (15% discount)
  │   └─ Beta User (10% discount)
  │
  ├─→ [DECISION] Spots available?
  │   ├─ NO → Show "Tier full" message
  │   │   └─ Suggest next tier or waitlist
  │   └─ YES → Show application form
  │
  ├─→ Fill Application Form
  │   ├─ Company name
  │   ├─ Contact name
  │   ├─ Email
  │   ├─ Phone (optional)
  │   ├─ Website (optional)
  │   ├─ Company size (dropdown)
  │   ├─ Industry (dropdown)
  │   ├─ Monthly test volume (dropdown)
  │   ├─ Current testing approach (textarea)
  │   └─ Why interested (textarea)
  │
  ├─→ Submit Application
  │
  ├─→ POST /api/early-adopter/apply
  │
  ├─→ Insert into early_adopter_applications
  │   └─ status: 'pending'
  │
  ├─→ Send confirmation email
  │
  ├─→ Redirect to /application-success?type=company
  │
  ├─→ Show Success Page
  │   ├─ Confirmation message
  │   ├─ What happens next timeline
  │   ├─ Expected review time (48 hours)
  │   └─ Links to signup or home
  │
  ├─→ [BACKGROUND] Admin reviews application
  │
  ├─→ [WHEN APPROVED]
  │   ├─ Send approval email
  │   ├─ Schedule onboarding call
  │   └─ Create early_adopter_companies record
  │
END
```

**Key Screens:**
1. `/early-adopter` - Application page with tier selection
2. `/application-success?type=company` - Success confirmation

**Email Notifications:**
1. Immediate: Application received confirmation
2. Within 48h: Approval or rejection
3. If approved: Onboarding call invitation

---

## Tester User Flows

### Flow 5: Tester Signup & Onboarding

```
START
  │
  ├─→ Visit Homepage or /tester/signup
  │
  ├─→ Navigate to /tester/signup
  │
  ├─→ Multi-Step Form
  │
  ├─→ STEP 1: Basic Info
  │   ├─ Email (required)
  │   ├─ Password (required, min 8 chars)
  │   ├─ Display name (required)
  │   └─ Age (required, 18+)
  │
  ├─→ STEP 2: Demographics
  │   ├─ Gender (optional)
  │   ├─ Location country (dropdown)
  │   ├─ Location city (optional)
  │   ├─ Occupation (optional)
  │   └─ Education level (dropdown)
  │
  ├─→ STEP 3: Experience
  │   ├─ Tech literacy (beginner/intermediate/advanced/expert)
  │   ├─ Years of testing experience (number)
  │   ├─ Primary device (dropdown)
  │   ├─ Languages (multi-select)
  │   └─ Previous platforms (textarea)
  │
  ├─→ Submit Form
  │
  ├─→ [DECISION] Valid data?
  │   ├─ NO → Show validation errors → Return to form
  │   └─ YES → Continue
  │
  ├─→ Create Supabase Auth User
  │   └─ user_type: 'tester'
  │
  ├─→ Insert into human_testers table
  │   └─ is_verified: false
  │
  ├─→ Send verification email
  │
  ├─→ Redirect to /tester/dashboard
  │
  ├─→ Show onboarding banner
  │   └─ "Complete your first test to get verified!"
  │
END
```

**Key Screens:**
1. `/tester/signup` - Multi-step signup form
2. `/tester/dashboard` - Dashboard with onboarding state

**Validation Rules:**
- Age must be 18+
- Email must be unique
- Password min 8 characters
- At least one language selected

---

### Flow 6: Complete a Test Assignment

```
START (Tester on /tester/dashboard)
  │
  ├─→ View Assigned Tests
  │   └─ List of test_assignments
  │
  ├─→ [DECISION] Has assignments?
  │   ├─ NO → Show "No assignments yet" state
  │   │   └─ "We'll notify you when tests are available"
  │   └─ YES → Show assignment list
  │
  ├─→ Click "Start Test" on assignment
  │
  ├─→ Navigate to /tester/tests/[id]/execute
  │
  ├─→ Update status to 'in_progress'
  │
  ├─→ Show Test Instructions
  │   ├─ URL to test
  │   ├─ Mission/objective
  │   ├─ Persona to adopt
  │   ├─ Platform details
  │   └─ Time estimate
  │
  ├─→ [ACTION] Start Testing
  │   └─ Opens URL in new tab or device
  │
  ├─→ Complete Test Steps
  │   ├─ Navigate website/app
  │   ├─ Follow mission objectives
  │   ├─ Document findings
  │   └─ Take screenshots
  │
  ├─→ Fill Test Report Form
  │   ├─ Overall sentiment (1-5 scale)
  │   ├─ Issues found (repeatable)
  │   │   ├─ Title
  │   │   ├─ Description
  │   │   ├─ Severity (dropdown)
  │   │   ├─ Category (dropdown)
  │   │   ├─ Screenshot upload
  │   │   └─ Element selector (optional)
  │   ├─ Recommendations (textarea)
  │   ├─ Positives (textarea)
  │   └─ Additional notes (textarea)
  │
  ├─→ Submit Report
  │
  ├─→ [DECISION] Valid submission?
  │   ├─ NO → Show validation errors
  │   │   └─ "Please add at least one issue or recommendation"
  │   └─ YES → Continue
  │
  ├─→ Update test_run status to 'completed'
  │
  ├─→ Insert issues into issues table
  │
  ├─→ Calculate earnings
  │   └─ Base rate + bonuses (quality, speed)
  │
  ├─→ Update tester stats
  │   ├─ total_tests_completed++
  │   ├─ total_earnings += amount
  │   └─ average_rating (recalculate)
  │
  ├─→ [IF FIRST TEST] Set is_verified = true
  │
  ├─→ Capture as training data
  │   └─ Insert into ai_training_data
  │
  ├─→ Update milestone progress
  │
  ├─→ Show success message
  │   └─ "Test completed! You earned $X"
  │
  ├─→ Redirect to /tester/dashboard
  │
END
```

**Key Screens:**
1. `/tester/dashboard` - Assignment list
2. `/tester/tests/[id]/execute` - Test execution interface

**Earnings Calculation:**
```
Base rate: $25
+ Quality bonus: $5 (if detailed report)
+ Speed bonus: $3 (if completed under estimated time)
+ First test bonus: $10 (one-time)
= Total: $25-$43
```

**Verification:**
- Tester becomes verified after first completed test
- Unlocks higher-paying assignments

---

### Flow 7: Founding Tester Application

```
START
  │
  ├─→ [ENTRY POINTS]
  │   ├─ Tester dashboard → See CTA banner
  │   ├─ Homepage → See EarlyAdopterCard
  │   └─ Navigation → Programs dropdown
  │
  ├─→ Click "Apply Now"
  │
  ├─→ Navigate to /founding-tester
  │
  ├─→ View Program Overview
  │   ├─ Tier comparison table
  │   ├─ Revenue share breakdown
  │   ├─ Equity details
  │   └─ Spots remaining counter
  │
  ├─→ Select Tier
  │   ├─ Founding Tester (40% + 0.05% equity)
  │   ├─ Early Tester (35% + 0.01% equity)
  │   └─ Beta Tester (32%, no equity)
  │
  ├─→ [DECISION] Spots available?
  │   ├─ NO → Show "Tier full" message
  │   └─ YES → Show application form
  │
  ├─→ Fill Application Form
  │   ├─ Full name
  │   ├─ Email
  │   ├─ Phone (optional)
  │   ├─ Location
  │   ├─ LinkedIn URL (optional)
  │   ├─ Portfolio URL (optional)
  │   ├─ Years of experience (dropdown)
  │   ├─ Testing specialties (multi-select)
  │   ├─ Platforms (multi-select)
  │   ├─ Availability (hours/week)
  │   ├─ Why interested (textarea)
  │   ├─ Relevant experience (textarea)
  │   └─ Sample work (URL or upload)
  │
  ├─→ Submit Application
  │
  ├─→ POST /api/founding-tester/apply
  │
  ├─→ Insert into founding_tester_applications
  │
  ├─→ Send confirmation email
  │
  ├─→ Redirect to /application-success?type=tester
  │
  ├─→ Show Success Page
  │   ├─ Confirmation message
  │   ├─ Review timeline
  │   └─ Next steps
  │
  ├─→ [BACKGROUND] Admin reviews
  │
  ├─→ [WHEN APPROVED]
  │   ├─ Send approval email
  │   ├─ Send equity documents
  │   ├─ Create founding_testers record
  │   └─ Create tester_equity_vesting record
  │
END
```

**Key Screens:**
1. `/founding-tester` - Application page
2. `/application-success?type=tester` - Success page

**Equity Vesting:**
- 4-year vesting schedule
- 6-month cliff
- Monthly vesting after cliff

---

## Admin User Flows

### Flow 8: Review Applications

```
START (Admin on /admin/applications)
  │
  ├─→ Fetch pending applications
  │   ├─ early_adopter_applications
  │   └─ founding_tester_applications
  │
  ├─→ Display Applications List
  │   ├─ Filter by type (company/tester)
  │   ├─ Filter by tier
  │   ├─ Sort by date
  │   └─ Search by name/email
  │
  ├─→ Click on application to review
  │
  ├─→ Show Application Details
  │   ├─ Applicant information
  │   ├─ Tier requested
  │   ├─ All form responses
  │   └─ Application date
  │
  ├─→ [DECISION] Approve or Reject?
  │
  ├─→ [IF APPROVE]
  │   ├─ Add approval notes
  │   ├─ Click "Approve"
  │   ├─ POST /api/admin/applications/[id]/review
  │   ├─ Update status to 'approved'
  │   ├─ Create early_adopter_companies or founding_testers record
  │   ├─ Send approval email
  │   └─ Show success message
  │
  ├─→ [IF REJECT]
  │   ├─ Add rejection reason
  │   ├─ Click "Reject"
  │   ├─ POST /api/admin/applications/[id]/review
  │   ├─ Update status to 'rejected'
  │   ├─ Send rejection email
  │   └─ Show success message
  │
  ├─→ Return to applications list
  │
END
```

**Key Screens:**
1. `/admin/applications` - Applications list with filters
2. `/admin/applications/[id]` - Application detail view

**Actions:**
- Approve (creates program record)
- Reject (sends rejection email)
- Request more info (sends follow-up email)

---

### Flow 9: Manage Fine-Tuning

```
START (Admin on /admin/training)
  │
  ├─→ GET /api/admin/training-data/stats
  │
  ├─→ Display Training Data Stats
  │   ├─ Overall stats
  │   │   ├─ Total examples
  │   │   ├─ High quality count
  │   │   ├─ Human verified count
  │   │   └─ Ready for training count
  │   └─ By model type
  │       ├─ issue_detector
  │       ├─ strategy_planner
  │       └─ sentiment_analyzer
  │
  ├─→ [DECISION] Enough data? (50+ examples)
  │   ├─ NO → Show "Insufficient data" message
  │   │   └─ Display progress: "20/50 examples"
  │   └─ YES → Enable "Start Fine-Tuning" button
  │
  ├─→ Select Model Type
  │   └─ Dropdown: issue_detector/strategy_planner/sentiment_analyzer
  │
  ├─→ Configure Training
  │   ├─ Min quality (default: 4)
  │   ├─ Require human verification (default: true)
  │   └─ Base model (default: gpt-4o-mini-2024-07-18)
  │
  ├─→ Click "Start Fine-Tuning"
  │
  ├─→ POST /api/admin/training/fine-tune
  │
  ├─→ [BACKEND PROCESS]
  │   ├─ Export training data to JSONL
  │   ├─ Upload to OpenAI
  │   ├─ Start fine-tuning job
  │   └─ Create training_batches record
  │
  ├─→ Show job started message
  │   └─ "Job ID: ftjob-abc123"
  │
  ├─→ Navigate to /admin/training/jobs
  │
  ├─→ Display Active Jobs
  │   └─ Poll GET /api/admin/training/status/[jobId]
  │
  ├─→ [WHEN JOB COMPLETES]
  │   ├─ Show "Succeeded" status
  │   ├─ Display fine-tuned model ID
  │   └─ Enable "Deploy" button
  │
  ├─→ Click "Deploy Model"
  │
  ├─→ POST /api/admin/training/status/[jobId]
  │   └─ action: 'deploy'
  │
  ├─→ [BACKEND PROCESS]
  │   ├─ Create ai_models record
  │   ├─ Set is_active = true
  │   └─ Update tiered reasoning config
  │
  ├─→ Show success message
  │   └─ "Model deployed to Phase 2!"
  │
END
```

**Key Screens:**
1. `/admin/training` - Training data stats
2. `/admin/training/jobs` - Active jobs list
3. `/admin/training/jobs/[id]` - Job detail view

**Job Statuses:**
- `validating_files` - Checking data format
- `queued` - Waiting to start
- `running` - Training in progress (10-60 min)
- `succeeded` - Ready to deploy
- `failed` - Error occurred

---

## Decision Trees

### Decision Tree 1: Test Type Routing

```
Test Request Submitted
        │
        ├─→ [CHECK] Test type?
        │
        ├─→ ai_only
        │   └─→ [CHECK] Current phase?
        │       ├─→ Phase 1: Use external APIs
        │       ├─→ Phase 2: Use fine-tuned models
        │       ├─→ Phase 3: Use self-hosted models
        │       └─→ Phase 4: Use hybrid ensemble
        │
        ├─→ human_only
        │   └─→ [CHECK] Tester available?
        │       ├─→ YES: Assign immediately
        │       └─→ NO: Queue for next available
        │
        └─→ hybrid
            └─→ Start with AI
                └─→ [CHECK] AI confidence?
                    ├─→ High (>0.8): Complete
                    └─→ Low (<0.8): Queue for human review
```

### Decision Tree 2: Quota Management

```
User requests test
        │
        ├─→ [CHECK] Plan type?
        │
        ├─→ Free (10/month)
        │   └─→ [CHECK] Tests used?
        │       ├─→ < 10: Allow test
        │       └─→ >= 10: Show upgrade modal
        │
        ├─→ Starter (50/month)
        │   └─→ [CHECK] Tests used?
        │       ├─→ < 50: Allow test
        │       └─→ >= 50: Show upgrade modal
        │
        ├─→ Pro (200/month)
        │   └─→ [CHECK] Tests used?
        │       ├─→ < 200: Allow test
        │       └─→ >= 200: Show upgrade modal
        │
        └─→ Enterprise (unlimited)
            └─→ Always allow test
```

### Decision Tree 3: Training Data Capture

```
Test completed
        │
        ├─→ [CHECK] Test type?
        │
        ├─→ AI test
        │   └─→ [CHECK] Company rating?
        │       ├─→ >= 4 stars: Capture as training data
        │       │   └─→ Insert into ai_training_data
        │       │       └─→ is_high_quality: true
        │       └─→ < 4 stars: Skip (low quality)
        │
        └─→ Human test
            └─→ Always capture
                └─→ Insert into ai_training_data
                    └─→ human_verified: true
```

### Decision Tree 4: Early Adopter Tier Selection

```
User applies for early adopter
        │
        ├─→ [CHECK] Spots available?
        │
        ├─→ Founding Partner (10 spots)
        │   ├─→ Available: Show application form
        │   └─→ Full: Suggest Early Adopter tier
        │
        ├─→ Early Adopter (40 spots)
        │   ├─→ Available: Show application form
        │   └─→ Full: Suggest Beta User tier
        │
        └─→ Beta User (150 spots)
            ├─→ Available: Show application form
            └─→ Full: Show waitlist signup
```

---

## Error Handling Flows

### Error Flow 1: Test Execution Failure

```
Test execution starts
        │
        ├─→ [TRY] Execute test
        │
        ├─→ [CATCH] Error occurs
        │
        ├─→ [CHECK] Error type?
        │
        ├─→ Network error
        │   ├─→ Retry (max 3 times)
        │   └─→ If still fails: Mark as failed
        │
        ├─→ Timeout error
        │   ├─→ Increase timeout
        │   ├─→ Retry once
        │   └─→ If still fails: Mark as failed
        │
        ├─→ Invalid URL
        │   └─→ Mark as failed immediately
        │       └─→ Notify company
        │
        ├─→ AI API error
        │   ├─→ Try fallback model
        │   └─→ If still fails: Queue for human
        │
        └─→ Unknown error
            ├─→ Log error details
            ├─→ Notify admin
            └─→ Offer refund/retry to company
```

### Error Flow 2: Payment Failure

```
User upgrades plan
        │
        ├─→ [TRY] Process payment
        │
        ├─→ [CATCH] Payment fails
        │
        ├─→ [CHECK] Failure reason?
        │
        ├─→ Insufficient funds
        │   └─→ Show "Card declined" message
        │       └─→ Prompt to try different card
        │
        ├─→ Invalid card
        │   └─→ Show "Invalid card" message
        │       └─→ Prompt to check details
        │
        ├─→ 3D Secure required
        │   └─→ Redirect to bank verification
        │       └─→ Return and retry payment
        │
        └─→ Unknown error
            ├─→ Log error
            ├─→ Show generic error message
            └─→ Prompt to contact support
```

---

## Edge Cases

### Edge Case 1: Concurrent Test Execution

**Scenario:** Company requests 10 tests simultaneously

**Handling:**
1. Check quota (allow if within limit)
2. Queue all tests
3. Execute with concurrency limit (max 3 concurrent)
4. Process remaining in queue
5. Update quota atomically to prevent race conditions

### Edge Case 2: Tester Abandons Test

**Scenario:** Tester starts test but doesn't complete

**Handling:**
1. After 24 hours of inactivity, mark as 'abandoned'
2. Reassign to another tester
3. Don't penalize first tester (no negative rating)
4. Notify company of delay

### Edge Case 3: Milestone Unlocks Mid-Test

**Scenario:** Phase 2 unlocks while test is running

**Handling:**
1. Complete current test with Phase 1 models
2. Next test uses Phase 2 models
3. Show banner: "Phase 2 unlocked! Next test will use fine-tuned models"

### Edge Case 4: Application Tier Fills During Submission

**Scenario:** User fills form, but tier fills before submission

**Handling:**
1. Check spots again on submission
2. If full, show error: "This tier just filled up"
3. Offer to apply for next tier
4. Pre-fill form data to avoid re-entry

### Edge Case 5: Duplicate Applications

**Scenario:** User applies multiple times

**Handling:**
1. Check for existing application by email
2. If pending: Show "You already applied"
3. If rejected: Allow reapplication after 30 days
4. If approved: Show "You're already in the program"

---

## Flow Metrics & Analytics

### Key Metrics to Track

**Signup Flows:**
- Conversion rate (visitor → signup)
- Drop-off points in multi-step forms
- Time to complete signup
- Verification rate

**Test Request Flows:**
- Time from request to completion
- Test success rate
- Retry rate
- Quota upgrade conversion

**Application Flows:**
- Application completion rate
- Approval rate by tier
- Time to review
- Conversion to active user

**Tester Flows:**
- Test completion rate
- Average time per test
- Quality score distribution
- Earnings per tester

---

**End of User Flows Documentation**
