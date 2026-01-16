# Missing Pages & Integration Checklist

## What's Actually Needed (Beyond 3 Pages)

### Pages to Create (5 total)

#### 1. Pricing Page Update
**File:** `app/(marketing)/pricing/page.tsx`
- Early adopter section at top
- Phase comparison table
- "Prices drop as AI improves" messaging
- CTAs to both application pages

#### 2. Early Adopter Application Page
**File:** `app/(marketing)/early-adopter/page.tsx`
- Application form
- Tier selection (Founding Partner, Early Adopter, Beta User)
- Benefits comparison
- Spots remaining counter
- Form validation
- Success redirect

#### 3. Founding Tester Application Page
**File:** `app/(marketing)/founding-tester/page.tsx`
- Application form
- Tier selection (Founding Tester, Early Tester, Beta Tester)
- Equity explanation
- Revenue share calculator
- Portfolio upload
- Success redirect

#### 4. Application Success Page
**File:** `app/(marketing)/application-success/page.tsx`
- Thank you message
- Next steps
- What to expect
- Timeline
- Contact info

#### 5. Tester Dashboard Enhancement
**File:** `app/tester/dashboard/page.tsx`
- Add "Apply for Founding Tester" CTA (if not already applied)
- Show application status if applied
- Show equity vesting progress if accepted

---

## CTAs & Links to Add

### Homepage (`app/(marketing)/page.tsx`)
**Already has:**
- ✅ ProgressBanner component
- ✅ EarlyAdopterCard component (both company & tester)

**Needs to add:**
- Link from EarlyAdopterCard to application pages
- Update existing CTAs to mention early adopter program

### Pricing Page (`app/(marketing)/pricing/page.tsx`)
**Needs:**
- "Apply as Early Adopter" button → `/early-adopter`
- "Join as Founding Tester" button → `/founding-tester`
- Countdown timer for spots remaining
- Phase unlock timeline

### Company Dashboard (`app/company/dashboard/page.tsx`)
**Already has:**
- ✅ PhaseProgressCard component

**Could add:**
- Banner if company qualifies for early adopter program
- "Upgrade to Early Adopter" CTA

### Tester Dashboard (`app/tester/dashboard/page.tsx`)
**Needs:**
- "Apply for Founding Tester Program" CTA (if eligible)
- Application status badge
- Equity vesting progress (if accepted)

### Navigation/Header
**Needs:**
- "Early Adopter" link in nav (for companies)
- "Founding Tester" link in nav (for testers)
- Or dropdown: "Programs" → Early Adopter, Founding Tester

### Footer
**Needs:**
- "Early Adopter Program" link
- "Founding Tester Program" link
- Under "Company" or "Programs" section

---

## Component Updates Needed

### EarlyAdopterCard (`components/EarlyAdopterCard.tsx`)
**Already has:**
- Displays both company and tester programs
- Shows spots remaining
- Shows benefits

**Needs to verify:**
- Links to correct application pages
- "Apply Now" button works
- Spots counter is live

### ProgressBanner (`components/ProgressBanner.tsx`)
**Already complete** - no changes needed

### PhaseProgressCard (`components/PhaseProgressCard.tsx`)
**Already complete** - no changes needed

---

## User Journey Flows

### Company Early Adopter Journey
1. **Homepage** → See EarlyAdopterCard (company side)
2. Click "Apply Now" → `/early-adopter`
3. Fill form → Submit
4. Redirect to `/application-success`
5. Receive email confirmation
6. Admin reviews → Approves
7. Company receives onboarding email
8. Company signs up with discount code

### Founding Tester Journey
1. **Homepage** or **Tester Signup** → See EarlyAdopterCard (tester side)
2. Click "Apply Now" → `/founding-tester`
3. Fill form + upload portfolio → Submit
4. Redirect to `/application-success`
5. Receive email confirmation
6. Admin reviews → Approves
7. Tester receives onboarding email
8. Tester starts testing with enhanced revenue share

---

## Email Templates Needed (Optional for MVP)

### 1. Application Received Email
- Thank you for applying
- What happens next
- Timeline for review

### 2. Application Approved Email
- Congratulations
- Next steps
- Onboarding call link
- Discount code (companies) or equity details (testers)

### 3. Application Rejected Email (if needed)
- Thank you for interest
- Invite to regular program
- Keep in touch

---

## Admin Dashboard Needs (Optional)

### Review Applications
**File:** `app/admin/applications/page.tsx`
- List of pending applications
- Approve/reject buttons
- View application details
- Send emails

---

## Total Files Needed

### Must Have (MVP):
1. ✅ `app/(marketing)/page.tsx` - Already updated
2. ❌ `app/(marketing)/pricing/page.tsx` - Update needed
3. ❌ `app/(marketing)/early-adopter/page.tsx` - Create
4. ❌ `app/(marketing)/founding-tester/page.tsx` - Create
5. ❌ `app/(marketing)/application-success/page.tsx` - Create
6. ❌ `app/tester/dashboard/page.tsx` - Update needed
7. ❌ `components/EarlyAdopterCard.tsx` - Verify links work
8. ❌ Navigation/Footer component - Add links

**Total: 8 files (5 new, 3 updates)**

### Nice to Have:
9. `app/admin/applications/page.tsx` - Admin review
10. Email templates (Resend integration)
11. Application status page (`app/application-status/[id]/page.tsx`)

---

## Implementation Order

### Phase 1 (Core Pages - 2 hours)
1. Create `/early-adopter` page
2. Create `/founding-tester` page
3. Create `/application-success` page
4. Update pricing page

### Phase 2 (Integration - 1 hour)
5. Update EarlyAdopterCard links
6. Update tester dashboard
7. Add navigation links
8. Add footer links

### Phase 3 (Polish - 1 hour)
9. Test all flows
10. Mobile responsiveness
11. Form validation
12. Error handling

### Phase 4 (Optional - Later)
13. Admin dashboard
14. Email notifications
15. Application status tracking

---

## What We Have vs What We Need

### ✅ Backend Complete
- API endpoints for applications ✅
- Database tables ✅
- Spots tracking ✅
- Validation logic ✅

### ✅ Components Complete
- EarlyAdopterCard ✅
- ProgressBanner ✅
- PhaseProgressCard ✅

### ❌ Pages Missing
- Application forms ❌
- Success page ❌
- Pricing page update ❌

### ❌ Integration Missing
- Navigation links ❌
- Dashboard CTAs ❌
- Form → API → Success flow ❌

---

## Priority

**High Priority (Do Now):**
1. Early adopter application page
2. Founding tester application page
3. Application success page
4. Update EarlyAdopterCard links

**Medium Priority (Do Soon):**
5. Update pricing page
6. Update tester dashboard
7. Add navigation links

**Low Priority (Can Wait):**
8. Admin dashboard
9. Email notifications
10. Application status tracking

---

## Estimated Time

- **Core pages:** 2-3 hours
- **Integration:** 1-2 hours
- **Testing:** 1 hour
- **Total:** 4-6 hours

**Want me to start building these now?**
