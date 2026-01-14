-- Test Assignments and Notifications System
-- Tracks tester assignments, declines, and in-app notifications

-- Test Assignments Table
CREATE TABLE IF NOT EXISTS test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_request_id UUID NOT NULL REFERENCES test_requests(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  ai_persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  tester_type TEXT NOT NULL CHECK (tester_type IN ('human', 'ai')),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'in_progress', 'completed', 'failed')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decline_reason TEXT,
  test_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either tester_id or ai_persona_id is set, not both
  CONSTRAINT check_tester_xor CHECK (
    (tester_id IS NOT NULL AND ai_persona_id IS NULL) OR
    (tester_id IS NULL AND ai_persona_id IS NOT NULL)
  )
);

-- Indexes for test assignments
CREATE INDEX idx_test_assignments_test_request ON test_assignments(test_request_id);
CREATE INDEX idx_test_assignments_tester ON test_assignments(tester_id);
CREATE INDEX idx_test_assignments_ai_persona ON test_assignments(ai_persona_id);
CREATE INDEX idx_test_assignments_status ON test_assignments(status);
CREATE INDEX idx_test_assignments_assigned_at ON test_assignments(assigned_at DESC);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('company', 'tester', 'admin')),
  type TEXT NOT NULL CHECK (type IN ('test_assigned', 'test_accepted', 'test_declined', 'test_completed', 'dispute_created', 'dispute_resolved', 'payment_received', 'tester_flagged', 'system_message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_type ON notifications(user_type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Test Assignment History (for tracking reassignments)
CREATE TABLE IF NOT EXISTS test_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_request_id UUID NOT NULL REFERENCES test_requests(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES test_assignments(id) ON DELETE SET NULL,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  ai_persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  tester_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('assigned', 'declined', 'reassigned', 'completed', 'failed')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_assignment_history_test_request ON test_assignment_history(test_request_id);
CREATE INDEX idx_test_assignment_history_created_at ON test_assignment_history(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_user_type TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, user_type, type, title, message, link, metadata)
  VALUES (p_user_id, p_user_type, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update test_assignments updated_at
CREATE OR REPLACE FUNCTION update_test_assignment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_assignments_updated_at
  BEFORE UPDATE ON test_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_test_assignment_timestamp();

-- Trigger to log assignment history
CREATE OR REPLACE FUNCTION log_test_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO test_assignment_history (
      test_request_id, assignment_id, tester_id, ai_persona_id, 
      tester_type, action, reason
    ) VALUES (
      NEW.test_request_id, NEW.id, NEW.tester_id, NEW.ai_persona_id,
      NEW.tester_type, 'assigned', NULL
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO test_assignment_history (
      test_request_id, assignment_id, tester_id, ai_persona_id,
      tester_type, action, reason
    ) VALUES (
      NEW.test_request_id, NEW.id, NEW.tester_id, NEW.ai_persona_id,
      NEW.tester_type, NEW.status, NEW.decline_reason
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_assignments_history_log
  AFTER INSERT OR UPDATE ON test_assignments
  FOR EACH ROW
  EXECUTE FUNCTION log_test_assignment_change();

-- Trigger to create notification when test is assigned to human tester
CREATE OR REPLACE FUNCTION notify_test_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_tester_user_id UUID;
  v_test_title TEXT;
BEGIN
  IF NEW.tester_type = 'human' AND NEW.tester_id IS NOT NULL THEN
    -- Get tester's user_id
    SELECT user_id INTO v_tester_user_id
    FROM human_testers
    WHERE id = NEW.tester_id;
    
    -- Get test title
    SELECT title INTO v_test_title
    FROM test_requests
    WHERE id = NEW.test_request_id;
    
    -- Create notification
    PERFORM create_notification(
      v_tester_user_id,
      'tester',
      'test_assigned',
      'New Test Assignment',
      'You have been assigned to test: ' || v_test_title,
      '/tester/tests/' || NEW.test_request_id::TEXT,
      jsonb_build_object('test_request_id', NEW.test_request_id, 'assignment_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_assignment_notification
  AFTER INSERT ON test_assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_test_assignment();

-- Comments
COMMENT ON TABLE test_assignments IS 'Tracks individual tester assignments to test requests with status tracking';
COMMENT ON TABLE notifications IS 'In-app notification system for users (companies, testers, admin)';
COMMENT ON TABLE test_assignment_history IS 'Audit log of all test assignment changes and reassignments';
COMMENT ON COLUMN test_assignments.tester_type IS 'Type of tester: human or ai';
COMMENT ON COLUMN test_assignments.status IS 'Assignment status: assigned, accepted, declined, in_progress, completed, failed';
COMMENT ON COLUMN notifications.type IS 'Notification type: test_assigned, test_completed, dispute_created, etc.';
COMMENT ON COLUMN notifications.user_type IS 'User type: company, tester, or admin';
