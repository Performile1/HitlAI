-- Enhanced RLS Policies with Team-Based Access
-- Addresses security concerns from Gemini audit

-- ============================================================================
-- HELPER FUNCTIONS FOR TEAM-BASED RLS
-- ============================================================================

-- Check if user is a member of a company
CREATE OR REPLACE FUNCTION is_member_of_company(target_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = target_company_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role in company
CREATE OR REPLACE FUNCTION has_company_role(target_company_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = target_company_id
    AND user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is owner or admin of company
CREATE OR REPLACE FUNCTION is_company_admin(target_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = target_company_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENHANCED RLS POLICIES FOR COMPANIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies are viewable by members" ON companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Companies are updatable by admins" ON companies;

-- Companies: Members can view their company
CREATE POLICY "Companies are viewable by members"
ON companies FOR SELECT
USING (is_member_of_company(id));

-- Companies: Authenticated users can create (signup flow)
CREATE POLICY "Companies are insertable by authenticated users"
ON companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Companies: Only owners/admins can update
CREATE POLICY "Companies are updatable by admins"
ON companies FOR UPDATE
USING (is_company_admin(id));

-- ============================================================================
-- ENHANCED RLS POLICIES FOR TEST REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS "Test requests are viewable by company members" ON test_requests;
DROP POLICY IF EXISTS "Test requests are insertable by company members" ON test_requests;
DROP POLICY IF EXISTS "Test requests are updatable by company members" ON test_requests;

-- Test Requests: Any company member can view (not just creator)
CREATE POLICY "Test requests are viewable by company members"
ON test_requests FOR SELECT
USING (is_member_of_company(company_id));

-- Test Requests: Any company member can create
CREATE POLICY "Test requests are insertable by company members"
ON test_requests FOR INSERT
WITH CHECK (is_member_of_company(company_id));

-- Test Requests: Any company member can update
CREATE POLICY "Test requests are updatable by company members"
ON test_requests FOR UPDATE
USING (is_member_of_company(company_id));

-- ============================================================================
-- ENHANCED RLS POLICIES FOR COMPANY MEMBERS
-- ============================================================================

DROP POLICY IF EXISTS "Company members are viewable by company members" ON company_members;
DROP POLICY IF EXISTS "Company members are insertable by owners" ON company_members;
DROP POLICY IF EXISTS "Company members are updatable by admins" ON company_members;
DROP POLICY IF EXISTS "Company members are deletable by admins" ON company_members;

-- Company Members: Members can view other members
CREATE POLICY "Company members are viewable by company members"
ON company_members FOR SELECT
USING (is_member_of_company(company_id));

-- Company Members: Only owners can add new members
CREATE POLICY "Company members are insertable by owners"
ON company_members FOR INSERT
WITH CHECK (has_company_role(company_id, 'owner'));

-- Company Members: Admins can update roles (but not owners)
CREATE POLICY "Company members are updatable by admins"
ON company_members FOR UPDATE
USING (
  is_company_admin(company_id) 
  AND role != 'owner' -- Can't modify owners
);

-- Company Members: Admins can remove members (but not owners)
CREATE POLICY "Company members are deletable by admins"
ON company_members FOR DELETE
USING (
  is_company_admin(company_id)
  AND role != 'owner' -- Can't remove owners
);

-- ============================================================================
-- ENHANCED RLS POLICIES FOR TEST RUNS
-- ============================================================================

DROP POLICY IF EXISTS "Test runs are viewable by company members" ON test_runs;

-- Test Runs: Company members can view all test runs for their company's requests
CREATE POLICY "Test runs are viewable by company members"
ON test_runs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_requests
    WHERE test_requests.id = test_runs.test_request_id
    AND is_member_of_company(test_requests.company_id)
  )
);

-- ============================================================================
-- ENHANCED RLS POLICIES FOR FRICTION POINTS
-- ============================================================================

DROP POLICY IF EXISTS "Friction points are viewable by company members" ON friction_points;

-- Friction Points: Company members can view friction points from their tests
CREATE POLICY "Friction points are viewable by company members"
ON friction_points FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_runs
    JOIN test_requests ON test_requests.id = test_runs.test_request_id
    WHERE test_runs.id = friction_points.test_run_id
    AND is_member_of_company(test_requests.company_id)
  )
);

-- ============================================================================
-- ENHANCED RLS POLICIES FOR HUMAN TEST ASSIGNMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Assignments are viewable by testers and company members" ON human_test_assignments;

-- Assignments: Testers can view their own, company members can view their company's
CREATE POLICY "Assignments are viewable by testers and company members"
ON human_test_assignments FOR SELECT
USING (
  tester_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM test_requests
    WHERE test_requests.id = human_test_assignments.test_request_id
    AND is_member_of_company(test_requests.company_id)
  )
);

-- ============================================================================
-- SECURITY AUDIT LOG
-- ============================================================================

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  resource_type TEXT,
  resource_id UUID,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX idx_security_audit_log_user ON security_audit_log(user_id, created_at DESC);
CREATE INDEX idx_security_audit_log_company ON security_audit_log(company_id, created_at DESC);
CREATE INDEX idx_security_audit_log_event ON security_audit_log(event_type, created_at DESC);

-- RLS for audit log (only admins and service role can view)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by company admins"
ON security_audit_log FOR SELECT
USING (
  company_id IS NOT NULL 
  AND is_company_admin(company_id)
);

-- ============================================================================
-- RATE LIMITING TABLE
-- ============================================================================

-- Track API usage for rate limiting
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limit checks
CREATE INDEX idx_api_rate_limits_user ON api_rate_limits(user_id, endpoint, window_end);
CREATE INDEX idx_api_rate_limits_company ON api_rate_limits(company_id, endpoint, window_end);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_company_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Get current request count in active window
  SELECT request_count INTO v_count
  FROM api_rate_limits
  WHERE user_id = p_user_id
  AND company_id = p_company_id
  AND endpoint = p_endpoint
  AND window_end > NOW();
  
  -- If no record or window expired, allow
  IF v_count IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN v_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_member_of_company IS 'Checks if current user is a member of specified company';
COMMENT ON FUNCTION has_company_role IS 'Checks if current user has specific role in company';
COMMENT ON FUNCTION is_company_admin IS 'Checks if current user is owner or admin of company';
COMMENT ON TABLE security_audit_log IS 'Logs security-relevant events for compliance and monitoring';
COMMENT ON TABLE api_rate_limits IS 'Tracks API usage for rate limiting per user/company';
