-- Enhanced Test Requests Schema
-- Adds comprehensive fields for test objectives, target audience, and context

-- ============================================================================
-- ADD NEW FIELDS TO TEST_REQUESTS
-- ============================================================================

-- Business context
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS business_objective TEXT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS success_criteria TEXT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS business_goal TEXT; -- brand_awareness, conversion, engagement, retention, etc.

-- Target audience
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}'::jsonb;
-- {
--   "primary": "seniors 65+",
--   "secondary": "tech-savvy millennials",
--   "demographics": {
--     "age_range": "25-65",
--     "tech_literacy": ["low", "medium"],
--     "locations": ["US", "UK", "CA"],
--     "languages": ["en", "es"]
--   },
--   "user_goals": ["purchase product", "find information", "contact support"]
-- }

-- Application context
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS app_type TEXT; -- e-commerce, saas, blog, portfolio, documentation, etc.
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS industry TEXT; -- retail, healthcare, finance, education, etc.
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS app_stage TEXT; -- prototype, beta, production, redesign
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS traffic_volume TEXT; -- low, medium, high, very_high

-- User journey context
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS critical_user_flows JSONB DEFAULT '[]'::jsonb;
-- ["signup", "checkout", "search", "contact_form", "account_settings"]

ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS known_issues JSONB DEFAULT '[]'::jsonb;
-- [
--   {"issue": "Slow checkout on mobile", "priority": "high"},
--   {"issue": "Confusing navigation", "priority": "medium"}
-- ]

-- Competitive context
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS competitor_urls TEXT[];
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS benchmark_against TEXT; -- "industry standard", "specific competitor", "previous version"

-- Testing focus
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS focus_areas JSONB DEFAULT '[]'::jsonb;
-- ["accessibility", "mobile_responsiveness", "checkout_flow", "first_time_user_experience", "senior_friendliness"]

ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS avoid_testing TEXT[]; -- Areas to skip
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS specific_concerns TEXT[]; -- Specific worries

-- Device & browser requirements
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS required_devices TEXT[] DEFAULT ARRAY['desktop'];
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS required_browsers TEXT[] DEFAULT ARRAY['chrome'];
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS screen_sizes TEXT[] DEFAULT ARRAY['medium'];

-- Additional context
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS recent_changes TEXT; -- "Redesigned checkout", "Added new feature X"
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS previous_test_results TEXT; -- Link to previous test or summary
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Budget & timeline
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS budget_range TEXT; -- low, medium, high, enterprise
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS urgency TEXT; -- low, medium, high, critical
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS preferred_completion_date TIMESTAMPTZ;

-- Deliverables
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS requested_deliverables JSONB DEFAULT '[]'::jsonb;
-- ["friction_points", "video_recording", "heatmap", "accessibility_report", "competitive_analysis"]

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_test_requests_business_goal ON test_requests(business_goal);
CREATE INDEX IF NOT EXISTS idx_test_requests_app_type ON test_requests(app_type);
CREATE INDEX IF NOT EXISTS idx_test_requests_industry ON test_requests(industry);
CREATE INDEX IF NOT EXISTS idx_test_requests_urgency ON test_requests(urgency);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to validate test request completeness
CREATE OR REPLACE FUNCTION validate_test_request(p_test_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_request RECORD;
  v_issues TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_completeness_score INT := 0;
BEGIN
  SELECT * INTO v_request
  FROM test_requests
  WHERE id = p_test_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Test request not found');
  END IF;
  
  -- Required fields
  IF v_request.title IS NULL OR v_request.title = '' THEN
    v_issues := array_append(v_issues, 'Title is required');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.url IS NULL OR v_request.url = '' THEN
    v_issues := array_append(v_issues, 'URL is required');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.mission IS NULL OR v_request.mission = '' THEN
    v_issues := array_append(v_issues, 'Mission/objective is required');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  -- Recommended fields
  IF v_request.business_objective IS NULL THEN
    v_warnings := array_append(v_warnings, 'Business objective not specified - helps prioritize findings');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.target_audience IS NULL OR v_request.target_audience = '{}'::jsonb THEN
    v_warnings := array_append(v_warnings, 'Target audience not specified - helps match testers');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.app_type IS NULL THEN
    v_warnings := array_append(v_warnings, 'App type not specified - helps select appropriate heuristics');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.critical_user_flows IS NULL OR v_request.critical_user_flows = '[]'::jsonb THEN
    v_warnings := array_append(v_warnings, 'Critical user flows not specified - helps focus testing');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.focus_areas IS NULL OR v_request.focus_areas = '[]'::jsonb THEN
    v_warnings := array_append(v_warnings, 'Focus areas not specified - testing will be general');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.success_criteria IS NULL THEN
    v_warnings := array_append(v_warnings, 'Success criteria not defined - unclear what constitutes a successful test');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  IF v_request.business_goal IS NULL THEN
    v_warnings := array_append(v_warnings, 'Business goal not specified - cannot apply dynamic heuristic weighting');
  ELSE
    v_completeness_score := v_completeness_score + 10;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(v_issues, 1) IS NULL,
    'issues', v_issues,
    'warnings', v_warnings,
    'completeness_score', v_completeness_score,
    'recommendation', CASE
      WHEN v_completeness_score >= 80 THEN 'Excellent - ready to run'
      WHEN v_completeness_score >= 60 THEN 'Good - consider adding more context'
      WHEN v_completeness_score >= 40 THEN 'Fair - add more details for better results'
      ELSE 'Poor - please provide more information'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN test_requests.business_objective IS 'What business problem is this test trying to solve?';
COMMENT ON COLUMN test_requests.success_criteria IS 'How will we know if the test was successful?';
COMMENT ON COLUMN test_requests.business_goal IS 'Primary business goal: brand_awareness, conversion, engagement, retention';
COMMENT ON COLUMN test_requests.target_audience IS 'JSON describing primary and secondary audiences, demographics, and user goals';
COMMENT ON COLUMN test_requests.app_type IS 'Type of application: e-commerce, saas, blog, documentation, etc.';
COMMENT ON COLUMN test_requests.industry IS 'Industry vertical: retail, healthcare, finance, education, etc.';
COMMENT ON COLUMN test_requests.critical_user_flows IS 'Array of critical user journeys to test: ["signup", "checkout", "search"]';
COMMENT ON COLUMN test_requests.known_issues IS 'Array of known issues to validate or investigate';
COMMENT ON COLUMN test_requests.focus_areas IS 'Specific areas to focus testing on: ["accessibility", "mobile", "checkout"]';
COMMENT ON COLUMN test_requests.competitor_urls IS 'Competitor websites to benchmark against';
COMMENT ON COLUMN test_requests.requested_deliverables IS 'What outputs are expected: ["friction_points", "video", "heatmap"]';
