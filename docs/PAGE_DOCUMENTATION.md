# HitlAI - Complete Page Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Total Pages:** 45

---

## Table of Contents

1. [Marketing Pages](#marketing-pages)
2. [Company Pages](#company-pages)
3. [Tester Pages](#tester-pages)
4. [Admin Pages](#admin-pages)
5. [API Routes](#api-routes)

---

## Marketing Pages

### 1. Homepage `/`
**File:** `app/(marketing)/page.tsx`

**Purpose:** Main landing page showcasing HitlAI's value proposition

**Components Used:**
- `ProgressBanner` - Shows milestone progress toward next phase unlock
- `EarlyAdopterCard` - Company and tester program cards
- Hero section with CTA buttons
- Features grid
- Testimonials
- Pricing preview

**API Calls:**
- `GET /api/milestones` - Fetch current phase progress

**User Permissions:** Public (no auth required)

**Key Features:**
- Responsive hero with gradient background
- Animated feature cards
- Real-time milestone progress
- Early adopter program CTAs
- Links to signup pages

**Navigation:**
- "Get Started" → `/company/signup`
- "Become a Tester" → `/tester/signup`
- "Apply for Early Adopter" → `/early-adopter`
- "Apply for Founding Tester" → `/founding-tester`

---

### 2. Pricing Page `/pricing`
**File:** `app/(marketing)/pricing/page.tsx`

**Purpose:** Display pricing plans and early adopter programs

**Components Used:**
- `EarlyAdopterCard` (x2) - Company and tester programs
- Pricing cards (Free, Starter, Pro, Enterprise)
- Phase evolution timeline
- FAQ section

**Sections:**
1. **Early Adopter Programs** - Tier comparison, spots remaining
2. **Phase Evolution** - How pricing improves over time
3. **Pay-Per-Test Pricing** - Credit packages
4. **Monthly Plans** - Subscription tiers
5. **FAQ** - Common pricing questions

**User Permissions:** Public

**Key Features:**
- Interactive tier selection
- Spots remaining counter (live data)
- Price evolution visualization
- Discount calculator
- Enterprise contact form

**API Calls:**
- `GET /api/early-adopter/apply` - Fetch available spots
- `GET /api/founding-tester/apply` - Fetch available spots

---

### 3. Features Page `/features`
**File:** `app/(marketing)/features/page.tsx`

**Purpose:** Detailed feature showcase

**Sections:**
- AI-powered testing
- Human testing network
- Hybrid orchestration
- Platform coverage
- Reporting and analytics
- Integrations

**User Permissions:** Public

---

### 4. About Page `/about`
**File:** `app/(marketing)/about/page.tsx`

**Purpose:** Company story, mission, team

**Sections:**
- Mission statement
- How it works
- Team members
- Company values
- Contact information

**User Permissions:** Public

---

### 5. Demo Page `/demo`
**File:** `app/(marketing)/demo/page.tsx`

**Purpose:** Interactive product demo

**Features:**
- Video walkthrough
- Interactive test simulator
- Sample test reports
- Platform selector

**User Permissions:** Public

---

### 6. Early Adopter Application `/early-adopter`
**File:** `app/(marketing)/early-adopter/page.tsx`

**Purpose:** Company early adopter program application

**Components Used:**
- Tier selection cards (Founding Partner, Early Adopter, Beta User)
- Multi-step application form
- Benefits comparison table
- Spots remaining counter

**Form Fields:**
- Company name (required)
- Contact name (required)
- Email (required)
- Phone (optional)
- Website (optional)
- Company size (dropdown)
- Industry (dropdown)
- Monthly test volume (dropdown)
- Current testing approach (textarea)
- Why interested (textarea)

**API Calls:**
- `GET /api/early-adopter/apply` - Check available spots
- `POST /api/early-adopter/apply` - Submit application

**Validation:**
- All required fields must be filled
- Valid email format
- Selected tier must have available spots

**Success Flow:**
- Redirect to `/application-success?type=company`
- Send confirmation email

**User Permissions:** Public

---

### 7. Founding Tester Application `/founding-tester`
**File:** `app/(marketing)/founding-tester/page.tsx`

**Purpose:** Tester program application with equity

**Components Used:**
- Tier selection cards (Founding Tester, Early Tester, Beta Tester)
- Application form with portfolio upload
- Revenue share calculator
- Equity vesting timeline

**Form Fields:**
- Full name (required)
- Email (required)
- Phone (optional)
- Location (required)
- LinkedIn URL (optional)
- Portfolio URL (optional)
- Years of experience (dropdown)
- Testing specialties (multi-select)
- Platforms (multi-select)
- Availability (hours/week)
- Why interested (textarea)
- Relevant experience (textarea)
- Sample work (URL or file upload)

**API Calls:**
- `GET /api/founding-tester/apply` - Check available spots
- `POST /api/founding-tester/apply` - Submit application

**Success Flow:**
- Redirect to `/application-success?type=tester`
- Send confirmation email

**User Permissions:** Public

---

### 8. Application Success `/application-success`
**File:** `app/(marketing)/application-success/page.tsx`

**Purpose:** Confirmation page after application submission

**Query Parameters:**
- `type` - "company" or "tester"

**Dynamic Content:**
- Different messaging based on type
- Timeline of next steps
- Expected review time (48 hours)
- Links to signup or home

**User Permissions:** Public

---

### 9. Blog Index `/blog`
**File:** `app/(marketing)/blog/page.tsx`

**Purpose:** Blog post listing

**Features:**
- Post grid with thumbnails
- Categories and tags
- Search functionality
- Pagination

**User Permissions:** Public

---

### 10. Blog Post `/blog/[slug]`
**File:** `app/(marketing)/blog/[slug]/page.tsx`

**Purpose:** Individual blog post

**Features:**
- Markdown rendering
- Code syntax highlighting
- Table of contents
- Share buttons
- Related posts

**User Permissions:** Public

---

### 11-14. Legal Pages
**Files:**
- `app/(marketing)/terms/page.tsx` - Terms of Service
- `app/(marketing)/privacy/page.tsx` - Privacy Policy
- `app/(marketing)/security/page.tsx` - Security Overview
- `app/(marketing)/careers/page.tsx` - Job Listings

**User Permissions:** Public

---

## Company Pages

### 15. Company Signup `/company/signup`
**File:** `app/company/signup/page.tsx`

**Purpose:** Company account registration

**Form Fields:**
- Company name (required)
- Email (required)
- Password (required, min 8 chars)
- Company size (dropdown)
- Industry (dropdown)

**API Calls:**
- `POST /auth/signup` - Supabase Auth
- Insert into `companies` table
- Insert into `company_members` table

**Success Flow:**
- Create auth user with `user_type: 'company'`
- Send verification email
- Redirect to `/company/dashboard`

**User Permissions:** Public (unauthenticated)

**Validation:**
- Email must be unique
- Password min 8 characters
- All required fields filled

---

### 16. Company Login `/company/login`
**File:** `app/company/login/page.tsx`

**Purpose:** Company authentication

**Form Fields:**
- Email (required)
- Password (required)
- Remember me (checkbox)

**API Calls:**
- `POST /auth/login` - Supabase Auth

**Success Flow:**
- Redirect to `/company/dashboard`

**Error Handling:**
- Invalid credentials → Show error message
- Account not verified → Show verification prompt
- Too many attempts → Rate limit message

**User Permissions:** Public (unauthenticated)

---

### 17. Company Dashboard `/company/dashboard`
**File:** `app/company/dashboard/page.tsx`

**Purpose:** Main company dashboard

**Components Used:**
- Stats cards (tests used, quota remaining, avg sentiment)
- Recent tests list
- Quick actions
- Milestone progress banner

**API Calls:**
- `GET /api/company/stats` - Fetch company statistics
- `GET /api/test-runs` - Fetch recent tests (with RLS)
- `GET /api/milestones` - Fetch milestone progress

**Sections:**
1. **Header** - Company name, plan type, logout button
2. **Stats** - Key metrics with visual cards
3. **Quick Actions** - "New Test", "View Reports", "Upgrade Plan"
4. **Recent Tests** - Table with status, date, sentiment
5. **Progress Banner** - Next phase unlock progress

**User Permissions:** Authenticated company members

**RLS Policy:** Users can only see their company's data

---

### 18. New Test Request `/company/tests/new`
**File:** `app/company/tests/new/page.tsx`

**Purpose:** Create new test request

**Form Sections:**

**1. Basic Information**
- URL (required, validated)
- Mission (required, min 20 chars)
- Additional context (optional)

**2. Persona Selection**
- Pre-defined personas (dropdown)
- Custom persona (modal form)

**3. Platform Configuration**
- Platform type (web/mobile)
- Browser/device selection
- Viewport/screen size
- Network speed simulation

**4. Test Type**
- AI only ($5)
- Human only ($25)
- Hybrid ($30)

**API Calls:**
- `POST /api/test-requests` - Create test request
- `POST /api/test/execute` - Start execution (if immediate)

**Validation:**
- URL must be valid and accessible
- Mission must be clear and specific
- Check quota before submission

**Success Flow:**
- Create test_request record
- Increment tests_used_this_month
- Redirect to `/company/tests/[id]`
- Start test execution

**User Permissions:** Authenticated company members

---

### 19. Test Results `/company/tests/[id]`
**File:** `app/company/tests/[id]/page.tsx`

**Purpose:** View test execution and results

**Dynamic Route:** `[id]` = test_run UUID

**Components Used:**
- Status indicator (pending/running/completed/failed)
- Progress bar (for running tests)
- Results display (for completed tests)
- Issue cards with severity badges
- Sentiment gauge
- Action buttons

**API Calls:**
- `GET /api/test-runs/[id]` - Fetch test run
- Real-time subscription to test_runs table

**UI States:**

**Pending:**
- Spinner animation
- "Test queued" message
- Estimated start time

**Running:**
- Progress bar (0-100%)
- Current step indicator
- Live updates via Supabase subscription

**Completed:**
- Sentiment score (0-1 scale with gauge)
- Issues found (list with severity)
- Recommendations
- Positives
- Final report (markdown)
- Rating prompt (1-5 stars)

**Failed:**
- Error message
- Retry button
- Contact support link

**Actions:**
- Rate AI performance
- Export report (PDF/JSON)
- Share via link
- Request human review (if AI-only)
- Run another test

**User Permissions:** Authenticated company members (own tests only)

---

### 20. Rate Test `/company/tests/[id]/rate`
**File:** `app/company/tests/[id]/rate/page.tsx`

**Purpose:** Rate AI test performance

**Form:**
- Star rating (1-5)
- Feedback text (optional)
- Specific issues (checkboxes)

**API Calls:**
- `POST /api/test-runs/[id]/rate` - Submit rating

**Success Flow:**
- Update `test_runs.company_ai_rating`
- If rating >= 4: Capture as training data
- Update milestone progress
- Redirect back to test results

**User Permissions:** Authenticated company members (own tests only)

---

### 21. Test Report `/company/tests/[id]/report`
**File:** `app/company/tests/[id]/report/page.tsx`

**Purpose:** Detailed test report view

**Features:**
- Full-page report layout
- Print-optimized styling
- Export to PDF
- Share via unique link

**User Permissions:** Authenticated company members (own tests only)

---

### 22. Company Settings `/company/settings`
**File:** `app/company/settings/page.tsx`

**Purpose:** Company account settings

**Sections:**
1. **Company Profile** - Name, industry, size
2. **Team Members** - Invite, manage roles
3. **Notifications** - Email, Slack, webhooks
4. **Integrations** - Jira, GitHub, etc.
5. **API Keys** - Generate, revoke
6. **Danger Zone** - Delete account

**API Calls:**
- `GET /api/company/settings` - Fetch settings
- `PUT /api/company/settings` - Update settings
- `POST /api/company/members/invite` - Invite member

**User Permissions:** Company owner or admin

---

### 23. Company Billing `/company/billing`
**File:** `app/company/billing/page.tsx`

**Purpose:** Billing and subscription management

**Sections:**
1. **Current Plan** - Plan details, usage
2. **Payment Method** - Credit card management
3. **Invoices** - Download past invoices
4. **Upgrade/Downgrade** - Change plan

**API Calls:**
- `GET /api/stripe/subscription` - Fetch subscription
- `POST /api/stripe/create-checkout` - Upgrade plan
- `GET /api/stripe/invoices` - Fetch invoices

**User Permissions:** Company owner or admin

---

## Tester Pages

### 24. Tester Signup `/tester/signup`
**File:** `app/tester/signup/page.tsx`

**Purpose:** Tester account registration

**Multi-Step Form:**

**Step 1: Basic Info**
- Email (required)
- Password (required)
- Display name (required)
- Age (required, 18+)

**Step 2: Demographics**
- Gender (optional)
- Location country (required)
- Location city (optional)
- Occupation (optional)
- Education level (optional)

**Step 3: Experience**
- Tech literacy (required)
- Years of testing experience (required)
- Primary device (required)
- Languages (multi-select, required)
- Previous platforms (optional)

**API Calls:**
- `POST /auth/signup` - Supabase Auth
- Insert into `human_testers` table

**Success Flow:**
- Create auth user with `user_type: 'tester'`
- Send verification email
- Redirect to `/tester/dashboard`

**User Permissions:** Public (unauthenticated)

---

### 25. Tester Login `/tester/login`
**File:** `app/tester/login/page.tsx`

**Purpose:** Tester authentication

**Similar to company login**

**User Permissions:** Public (unauthenticated)

---

### 26. Tester Dashboard `/tester/dashboard`
**File:** `app/tester/dashboard/page.tsx`

**Purpose:** Main tester dashboard

**Components Used:**
- Stats cards (available, in progress, completed, rating)
- Founding Tester CTA banner
- Test assignments list
- Verification notice (if not verified)

**API Calls:**
- `GET /api/tester/profile` - Fetch tester profile
- `GET /api/tester/assignments` - Fetch test assignments

**Sections:**
1. **Header** - Display name, verification status, logout
2. **Stats** - Available tests, in progress, completed, rating
3. **Founding Tester CTA** - Apply for program (if not already)
4. **Verification Notice** - If not verified yet
5. **Test Assignments** - List with "Start Test" buttons

**User Permissions:** Authenticated testers

---

### 27. Test Execution `/tester/tests/[id]/execute`
**File:** `app/tester/tests/[id]/execute/page.tsx`

**Purpose:** Execute assigned test

**Sections:**

**1. Test Instructions**
- URL to test
- Mission/objective
- Persona to adopt
- Platform details
- Time estimate

**2. Test Report Form**
- Overall sentiment (1-5 scale)
- Issues found (repeatable)
  - Title
  - Description
  - Severity
  - Category
  - Screenshot upload
  - Element selector
- Recommendations (textarea)
- Positives (textarea)
- Additional notes (textarea)

**API Calls:**
- `GET /api/test-runs/[id]` - Fetch test details
- `POST /api/test-runs/[id]/submit` - Submit report

**Success Flow:**
- Update test_run status to 'completed'
- Insert issues into issues table
- Calculate earnings
- Update tester stats
- If first test: Set is_verified = true
- Capture as training data
- Redirect to dashboard

**User Permissions:** Authenticated testers (assigned tests only)

---

### 28. Test Assignment Details `/tester/tests/[id]`
**File:** `app/tester/tests/[id]/page.tsx`

**Purpose:** View test assignment details before starting

**User Permissions:** Authenticated testers (assigned tests only)

---

### 29. Tester Earnings `/tester/earnings`
**File:** `app/tester/earnings/page.tsx`

**Purpose:** Earnings tracking and history

**Sections:**
1. **Total Earnings** - Lifetime, this month, pending
2. **Earnings Chart** - Historical earnings graph
3. **Transaction History** - Detailed list
4. **Payout Settings** - Payment method, schedule

**API Calls:**
- `GET /api/tester/earnings` - Fetch earnings data

**User Permissions:** Authenticated testers

---

### 30. Tester Performance `/tester/performance`
**File:** `app/tester/performance/page.tsx`

**Purpose:** Performance metrics and feedback

**Sections:**
1. **Overall Rating** - Average rating with trend
2. **Tests Completed** - Total count, completion rate
3. **Quality Metrics** - Issue detection rate, detail level
4. **Speed Metrics** - Average time per test
5. **Badges & Achievements** - Earned badges

**User Permissions:** Authenticated testers

---

### 31. Tester Settings `/tester/settings`
**File:** `app/tester/settings/page.tsx`

**Purpose:** Tester account settings

**Sections:**
1. **Profile** - Display name, demographics
2. **Preferences** - Notification settings, availability
3. **Payment** - Payout method, tax info
4. **Privacy** - Data sharing preferences

**User Permissions:** Authenticated testers

---

### 32. Mission Control `/tester/mission-control`
**File:** `app/tester/mission-control/page.tsx`

**Purpose:** Advanced tester dashboard with analytics

**Features:**
- Real-time assignment feed
- Performance analytics
- Leaderboard
- Upcoming tests

**User Permissions:** Authenticated testers (verified)

---

## Admin Pages

### 33. Admin Login `/admin/login`
**File:** `app/admin/login/page.tsx`

**Purpose:** Admin authentication

**User Permissions:** Public (admin credentials required)

---

### 34. Admin Tests `/admin/tests`
**File:** `app/admin/tests/page.tsx`

**Purpose:** View and manage all tests

**Features:**
- Filter by status, company, tester
- Search by URL or mission
- Bulk actions
- Test assignment

**API Calls:**
- `GET /api/admin/tests` - Fetch all tests

**User Permissions:** Admin only

---

### 35. Admin Applications `/admin/applications`
**File:** Not yet created (mentioned in flows)

**Purpose:** Review early adopter and founding tester applications

**Features:**
- Filter by type (company/tester)
- Filter by tier
- Approve/reject actions
- Add notes

**API Calls:**
- `GET /api/admin/applications` - Fetch pending applications
- `POST /api/admin/applications/[id]/review` - Approve/reject

**User Permissions:** Admin only

---

### 36. Admin Training `/admin/training`
**File:** Not yet created (mentioned in flows)

**Purpose:** Manage AI training and fine-tuning

**Features:**
- Training data statistics
- Start fine-tuning jobs
- View job status
- Deploy models

**API Calls:**
- `GET /api/admin/training-data/stats` - Fetch stats
- `POST /api/admin/training/fine-tune` - Start job
- `GET /api/admin/training/status/[jobId]` - Check status
- `POST /api/admin/training/status/[jobId]` - Deploy model

**User Permissions:** Admin only

---

### 37. Admin Disputes `/admin/disputes`
**File:** `app/admin/disputes/page.tsx`

**Purpose:** Handle test disputes

**User Permissions:** Admin only

---

### 38. Admin Dispute Details `/admin/disputes/[id]`
**File:** `app/admin/disputes/[id]/page.tsx`

**Purpose:** Review individual dispute

**User Permissions:** Admin only

---

### 39. Admin Flagged Testers `/admin/flagged-testers`
**File:** `app/admin/flagged-testers/page.tsx`

**Purpose:** Review testers flagged for quality issues

**User Permissions:** Admin only

---

### 40. Admin Digital Twins `/admin/digital-twins`
**File:** `app/admin/digital-twins/page.tsx`

**Purpose:** Manage AI persona digital twins

**User Permissions:** Admin only

---

### 41. Admin Blog Management `/admin/blog`
**File:** `app/admin/blog/page.tsx`

**Purpose:** Manage blog posts

**User Permissions:** Admin only

---

### 42. Admin New Blog Post `/admin/blog/new`
**File:** `app/admin/blog/new/page.tsx`

**Purpose:** Create new blog post

**User Permissions:** Admin only

---

### 43. Admin Settings `/admin/settings`
**File:** `app/admin/settings/page.tsx`

**Purpose:** Platform-wide settings

**User Permissions:** Admin only

---

### 44. Admin Style Guide `/admin/style-guide`
**File:** `app/admin/style-guide/page.tsx`

**Purpose:** Component style guide and design system

**User Permissions:** Admin only

---

### 45. Admin Forge `/admin/forge`
**File:** `app/admin/forge/page.tsx`

**Purpose:** Development tools and utilities

**User Permissions:** Admin only

---

## API Routes

### Test Execution
- `POST /api/test/execute` - Execute test run
- `GET /api/test-runs` - List test runs
- `GET /api/test-runs/[id]` - Get test run details
- `POST /api/test-runs/[id]/rate` - Rate test

### Milestones
- `GET /api/milestones` - Get milestone progress
- `POST /api/milestones` - Update milestones (admin)

### Early Adopter
- `GET /api/early-adopter/apply` - Get available spots
- `POST /api/early-adopter/apply` - Submit application

### Founding Tester
- `GET /api/founding-tester/apply` - Get available spots
- `POST /api/founding-tester/apply` - Submit application

### Training & Fine-Tuning
- `GET /api/admin/training-data/stats` - Get training stats
- `POST /api/admin/training/fine-tune` - Start fine-tuning
- `GET /api/admin/training/status/[jobId]` - Check job status
- `POST /api/admin/training/status/[jobId]` - Deploy/cancel job

### Admin
- `GET /api/admin/applications` - Get pending applications
- `POST /api/admin/applications/[id]/review` - Review application
- `GET /api/admin/tests` - Get all tests

---

## Page Access Matrix

| Page Type | Public | Company | Tester | Admin |
|-----------|--------|---------|--------|-------|
| Marketing | ✅ | ✅ | ✅ | ✅ |
| Company Auth | ✅ | ❌ | ❌ | ❌ |
| Company Dashboard | ❌ | ✅ | ❌ | ✅ |
| Tester Auth | ✅ | ❌ | ❌ | ❌ |
| Tester Dashboard | ❌ | ❌ | ✅ | ✅ |
| Admin | ❌ | ❌ | ❌ | ✅ |

---

## Common Patterns

### Authentication Check
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  redirect('/company/login')
}
```

### RLS Data Fetching
```typescript
const { data, error } = await supabase
  .from('test_runs')
  .select('*')
  .eq('company_id', companyId)
  // RLS automatically filters to user's company
```

### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('test-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'test_runs',
    filter: `id=eq.${testId}`
  }, (payload) => {
    setTestRun(payload.new)
  })
  .subscribe()
```

---

**End of Page Documentation**
