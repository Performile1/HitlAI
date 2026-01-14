# Test Management & Notification System

## Overview

HitlAI now includes a comprehensive test management system that allows admins to monitor all tests, track tester assignments, handle declines, and automatically reassign testers. The system also includes an in-app notification system for real-time updates.

## Features

### 1. Admin Test Management Page (`/admin/tests`)

**Access:** Only `admin@hitlai.com`

**Features:**
- ✅ View all tests across all companies
- ✅ Filter by status: All, Pending, In Progress, Completed
- ✅ See detailed assignment statistics for each test
- ✅ Track human and AI tester assignments
- ✅ Monitor declined assignments
- ✅ Auto-reassign declined testers with one click
- ✅ View test progress in real-time

**Test Status Tracking:**
- **Pending**: Test created, waiting for assignments
- **In Progress**: Testers are actively working on the test
- **Completed**: All tests finished
- **Failed**: Test execution failed

**Assignment Status Tracking:**
- **Assigned**: Tester has been assigned but hasn't responded
- **Accepted**: Tester accepted the assignment
- **Declined**: Tester declined the assignment
- **In Progress**: Tester is actively working
- **Completed**: Tester finished the test
- **Failed**: Test execution failed

### 2. Tester Assignment System

**Database Tables:**

#### `test_assignments`
Tracks individual tester assignments to test requests.

```sql
- id: UUID (primary key)
- test_request_id: UUID (references test_requests)
- tester_id: UUID (references human_testers, nullable)
- ai_persona_id: UUID (references personas, nullable)
- tester_type: 'human' | 'ai'
- status: 'assigned' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'failed'
- assigned_at: timestamp
- responded_at: timestamp (when tester accepts/declines)
- started_at: timestamp (when test starts)
- completed_at: timestamp (when test completes)
- decline_reason: text (why tester declined)
- test_result: jsonb (test execution results)
```

**Constraints:**
- Either `tester_id` OR `ai_persona_id` must be set (XOR constraint)
- Cannot have both human and AI assigned to same assignment

#### `test_assignment_history`
Audit log of all assignment changes.

```sql
- id: UUID
- test_request_id: UUID
- assignment_id: UUID
- tester_id: UUID (nullable)
- ai_persona_id: UUID (nullable)
- tester_type: 'human' | 'ai'
- action: 'assigned' | 'declined' | 'reassigned' | 'completed' | 'failed'
- reason: text
- created_at: timestamp
```

### 3. Decline Handling & Auto-Reassignment

**How It Works:**

1. **Tester Declines Assignment**
   - Status changes to `declined`
   - Decline reason is recorded
   - History log is created
   - Admin is notified

2. **Admin Clicks "Reassign" Button**
   - System finds all declined assignments for the test
   - For each declined human tester:
     - Searches for available replacement testers
     - Scores testers based on:
       - Preferred test types match (+10 points)
       - Tech literacy match (+5 points)
       - Previous platform experience
     - Assigns best-matching tester
     - Creates notification for new tester
   - If no human testers available:
     - Falls back to AI persona
     - Creates AI assignment instead

3. **Company is Notified**
   - Receives notification about replacements
   - Can view updated assignments in test details

**API Endpoint:**
```typescript
POST /api/admin/tests/reassign-declined
Body: { testRequestId: string }

Response: {
  success: true,
  declined_count: number,
  replaced_count: number,
  replacements: Array<{
    type: 'human' | 'ai',
    tester_name: string,
    assignment_id: string,
    fallback?: boolean // true if AI was used as fallback
  }>
}
```

### 4. In-App Notification System

**Database Table: `notifications`**

```sql
- id: UUID
- user_id: UUID (references auth.users)
- user_type: 'company' | 'tester' | 'admin'
- type: notification type (see below)
- title: text
- message: text
- link: text (optional, link to relevant page)
- read: boolean (default false)
- metadata: jsonb (additional data)
- created_at: timestamp
- read_at: timestamp (when marked as read)
```

**Notification Types:**
- `test_assigned`: Tester assigned to a test
- `test_accepted`: Tester accepted assignment
- `test_declined`: Tester declined assignment
- `test_completed`: Test completed
- `dispute_created`: New dispute filed
- `dispute_resolved`: Dispute resolved
- `payment_received`: Payment processed
- `tester_flagged`: Tester flagged by admin
- `system_message`: General system notification

**UI Component: `NotificationBell`**

Located in header/navigation, shows:
- 🔔 Bell icon with unread count badge
- Dropdown with recent notifications (last 10)
- Real-time updates via Supabase subscriptions
- Click notification to mark as read and navigate to link
- "Mark all as read" button
- Link to full notifications page

**Usage:**
```tsx
import { NotificationBell } from '@/components/NotificationBell'

<NotificationBell 
  userId={user.id} 
  userType="tester" // or 'company' or 'admin'
/>
```

**Real-time Updates:**
- Uses Supabase Realtime subscriptions
- Automatically updates when new notifications arrive
- No page refresh needed

### 5. Notification Triggers

**Automatic Notifications:**

1. **Test Assignment** (Human Testers)
   - Trigger: New assignment created with `tester_type='human'`
   - Recipient: Assigned tester
   - Type: `test_assigned`
   - Message: "You have been assigned to test: [Test Title]"
   - Link: `/tester/tests/{testRequestId}`

2. **Tester Reassignment** (Companies)
   - Trigger: Admin reassigns declined testers
   - Recipient: Company owner
   - Type: `system_message`
   - Message: "X replacement tester(s) have been assigned to your test: [Test Title]"
   - Link: `/company/tests/{testRequestId}`

**SQL Functions:**

```sql
-- Create a notification
SELECT create_notification(
  p_user_id := 'user-uuid',
  p_user_type := 'tester',
  p_type := 'test_assigned',
  p_title := 'New Test Assignment',
  p_message := 'You have been assigned to test: Example Test',
  p_link := '/tester/tests/test-uuid',
  p_metadata := '{"test_request_id": "test-uuid"}'::jsonb
);

-- Mark notification as read
SELECT mark_notification_read('notification-uuid');

-- Mark all notifications as read for a user
SELECT mark_all_notifications_read('user-uuid');
```

## Usage Examples

### Admin: View All Tests

1. Log in as `admin@hitlai.com`
2. Navigate to **Test Management** in sidebar
3. See all tests with status, assignments, and progress
4. Filter by status (All, Pending, In Progress, Completed)

### Admin: Handle Declined Testers

1. Go to **Test Management**
2. Find test with declined assignments (red warning badge)
3. Click **"Reassign"** button
4. System automatically finds and assigns replacement testers
5. Company and new testers receive notifications

### Tester: Receive Assignment Notification

1. Tester is assigned to a test
2. Notification bell shows unread count
3. Click bell to see notification
4. Click notification to view test details
5. Accept or decline assignment

### Company: Monitor Test Progress

1. Create test request
2. Testers are automatically assigned
3. Receive notifications when:
   - Testers accept/decline
   - Tests are completed
   - Replacements are assigned (if needed)
4. View real-time progress in test details

## Database Migration

**File:** `supabase/migrations/20260114000003_test_assignments_and_notifications.sql`

**Run Migration:**
```bash
# Using Supabase CLI
supabase db push

# Or manually
psql $DATABASE_URL -f supabase/migrations/20260114000003_test_assignments_and_notifications.sql
```

**What It Creates:**
- ✅ `test_assignments` table
- ✅ `notifications` table
- ✅ `test_assignment_history` table
- ✅ Indexes for performance
- ✅ Triggers for automatic logging
- ✅ Triggers for automatic notifications
- ✅ SQL functions for notification management

## Testing the System

### 1. Create Test Assignment

```sql
-- Assign human tester to test
INSERT INTO test_assignments (
  test_request_id,
  tester_id,
  tester_type,
  status
) VALUES (
  'test-request-uuid',
  'tester-uuid',
  'human',
  'assigned'
);

-- This automatically:
-- 1. Creates notification for tester
-- 2. Logs assignment in history table
```

### 2. Simulate Decline

```sql
-- Tester declines assignment
UPDATE test_assignments
SET 
  status = 'declined',
  decline_reason = 'Not available this week',
  responded_at = NOW()
WHERE id = 'assignment-uuid';

-- This automatically logs the decline in history
```

### 3. Test Reassignment API

```bash
curl -X POST http://localhost:3000/api/admin/tests/reassign-declined \
  -H "Content-Type: application/json" \
  -d '{"testRequestId": "test-request-uuid"}'
```

### 4. Check Notifications

```sql
-- View all notifications for a user
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Count unread notifications
SELECT COUNT(*) FROM notifications
WHERE user_id = 'user-uuid' AND read = FALSE;
```

## Performance Considerations

**Indexes Created:**
- `test_assignments`: test_request_id, tester_id, ai_persona_id, status, assigned_at
- `notifications`: user_id, user_type, read, created_at
- `test_assignment_history`: test_request_id, created_at

**Optimizations:**
- Composite index on `(user_id, read)` for fast unread queries
- Partial index on unread notifications
- Efficient real-time subscriptions using Supabase channels

## Future Enhancements

- [ ] Email notifications (in addition to in-app)
- [ ] Push notifications for mobile
- [ ] Notification preferences (what types to receive)
- [ ] Batch reassignment for multiple tests
- [ ] Smart tester matching algorithm improvements
- [ ] Notification digest (daily/weekly summary)
- [ ] Tester availability calendar
- [ ] Auto-decline after X hours of no response

## Social Sharing Component

**Bonus Feature:** `SocialShare` component for sharing test results and tester profiles.

**Usage:**
```tsx
import { SocialShare } from '@/components/SocialShare'

<SocialShare
  url="https://hitlai.com/test-results/123"
  title="Check out our test results!"
  description="95% success rate on our latest UX test"
  hashtags={['HitlAI', 'UXTesting', 'QA']}
  variant="outline"
  size="default"
/>
```

**Platforms Supported:**
- LinkedIn
- X (Twitter)
- Copy Link

## Security Notes

- ✅ Admin-only access to test management page
- ✅ Email-based admin authentication (`admin@hitlai.com`)
- ✅ Row-level security should be enabled on all tables
- ✅ Notifications filtered by user_id
- ✅ Real-time subscriptions filtered by user_id
- ✅ API endpoints validate admin access

## Troubleshooting

### Notifications Not Appearing

1. Check user is logged in
2. Verify `user_id` matches in notifications table
3. Check browser console for Supabase errors
4. Ensure Realtime is enabled in Supabase project

### Reassignment Not Working

1. Check available testers exist (`is_available = true`)
2. Verify testers are verified (`is_verified = true`)
3. Check API logs for errors
4. Ensure test request exists

### Assignment History Not Logging

1. Verify triggers are created
2. Check PostgreSQL logs
3. Ensure `test_assignment_history` table exists
