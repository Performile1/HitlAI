# Phase 1: Human Tester Workflow

## Week 1: Browser Extension Test Viewer

**Files to Create**:
1. `extension/manifest.json` - Chrome extension config
2. `extension/content.js` - Inject annotation overlay
3. `extension/background.js` - Handle messaging
4. `components/TestViewer.tsx` - Main viewer component
5. `components/AnnotationCanvas.tsx` - Drawing tool

**Key Features**:
- Bypass CORS with extension
- Real-time annotations via Supabase Realtime
- Canvas API for markup
- Video timestamp sync

## Week 2: Tester Dashboard

**Files to Create**:
1. `app/tester/dashboard/page.tsx`
2. `app/tester/tests/[id]/page.tsx`
3. `components/TestCard.tsx`
4. `lib/tester/testAcceptance.ts`

**Database**: Use existing `test_assignments`, `tester_annotations` tables

## Week 3: Payout Tracking

**Files to Create**:
1. `app/tester/earnings/page.tsx`
2. `lib/billing/testerPayouts.ts`
3. Integration with `tester_payments` table

**Next**: Phase 2 (Credits & App Upload)
