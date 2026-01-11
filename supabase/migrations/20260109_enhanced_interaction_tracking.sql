-- Enhanced Interaction Tracking: Scrolls, Clicks, Loading Times, Time on Pages
-- Adds comprehensive metrics for user behavior analysis

-- ============================================================================
-- PAGE PERFORMANCE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  
  -- Page details
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  
  -- Loading performance (from Navigation Timing API)
  dns_lookup_time INTEGER, -- milliseconds
  tcp_connection_time INTEGER,
  tls_negotiation_time INTEGER,
  request_time INTEGER,
  response_time INTEGER,
  dom_processing_time INTEGER,
  dom_content_loaded_time INTEGER,
  page_load_time INTEGER, -- Total time to fully load
  first_paint_time INTEGER,
  first_contentful_paint_time INTEGER,
  largest_contentful_paint_time INTEGER,
  
  -- Time on page
  page_entered_at TIMESTAMPTZ NOT NULL,
  page_exited_at TIMESTAMPTZ,
  time_on_page_seconds INTEGER,
  
  -- Visibility
  was_visible BOOLEAN DEFAULT true,
  total_visible_time_seconds INTEGER,
  total_hidden_time_seconds INTEGER,
  
  -- Exit behavior
  exit_type TEXT, -- navigation, back_button, close_tab, timeout
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCROLL TRACKING (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scroll_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  
  -- Scroll position
  timestamp TIMESTAMPTZ NOT NULL,
  scroll_x INTEGER NOT NULL,
  scroll_y INTEGER NOT NULL,
  
  -- Viewport dimensions
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Document dimensions
  document_width INTEGER,
  document_height INTEGER,
  
  -- Scroll metrics
  scroll_depth_percentage NUMERIC, -- How far down the page (0-100%)
  scroll_direction TEXT, -- up, down, left, right
  scroll_velocity NUMERIC, -- pixels per second
  
  -- Scroll type
  scroll_type TEXT, -- mouse_wheel, trackpad, scrollbar, keyboard, touch
  
  -- Context
  element_in_view TEXT, -- What element is currently visible
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLICK TRACKING (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  
  -- Click details
  timestamp TIMESTAMPTZ NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  
  -- Click type
  button TEXT NOT NULL, -- left, right, middle
  click_type TEXT NOT NULL, -- single, double, triple, right_click
  
  -- Target element
  target_element TEXT NOT NULL,
  target_selector TEXT,
  target_text TEXT,
  target_href TEXT, -- If it's a link
  target_id TEXT,
  target_class TEXT,
  
  -- Click context
  is_rage_click BOOLEAN DEFAULT false, -- Multiple clicks in same area quickly
  rage_click_count INTEGER, -- Number of rapid clicks
  time_since_last_click INTEGER, -- milliseconds
  
  -- Element state
  element_visible BOOLEAN,
  element_clickable BOOLEAN,
  element_disabled BOOLEAN,
  
  -- Outcome
  navigation_occurred BOOLEAN, -- Did click cause navigation?
  error_occurred BOOLEAN, -- Did click cause an error?
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FORM INTERACTION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS form_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  
  -- Form details
  form_id TEXT,
  form_name TEXT,
  form_action TEXT,
  
  -- Field details
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- text, email, password, select, checkbox, etc.
  field_label TEXT,
  
  -- Interaction
  interaction_type TEXT NOT NULL, -- focus, blur, input, change, submit
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Input metrics
  time_to_first_input INTEGER, -- milliseconds from page load
  time_in_field INTEGER, -- milliseconds spent in field
  character_count INTEGER,
  backspace_count INTEGER, -- How many times user deleted text
  paste_detected BOOLEAN,
  
  -- Validation
  validation_error TEXT,
  error_message TEXT,
  
  -- Completion
  field_completed BOOLEAN,
  form_submitted BOOLEAN,
  form_abandoned BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RAGE CLICK DETECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS rage_click_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  
  -- Incident details
  timestamp TIMESTAMPTZ NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  
  -- Rage metrics
  click_count INTEGER NOT NULL, -- Number of rapid clicks
  time_window_ms INTEGER NOT NULL, -- Time span of clicks
  clicks_per_second NUMERIC,
  
  -- Target
  target_element TEXT,
  target_selector TEXT,
  
  -- Analysis
  likely_cause TEXT, -- button_not_working, slow_response, hidden_element, etc.
  element_was_clickable BOOLEAN,
  element_was_visible BOOLEAN,
  
  -- Screenshot
  screenshot_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SESSION SUMMARY METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE UNIQUE,
  
  -- Overall session
  total_duration_seconds INTEGER,
  pages_visited INTEGER,
  total_clicks INTEGER,
  total_scrolls INTEGER,
  total_form_interactions INTEGER,
  
  -- Performance
  avg_page_load_time INTEGER,
  slowest_page_url TEXT,
  slowest_page_load_time INTEGER,
  
  -- Engagement
  total_scroll_distance INTEGER, -- Total pixels scrolled
  max_scroll_depth_percentage NUMERIC, -- Deepest scroll on any page
  avg_time_per_page_seconds NUMERIC,
  
  -- Frustration indicators
  rage_click_count INTEGER,
  back_button_count INTEGER,
  form_abandonment_count INTEGER,
  error_count INTEGER,
  
  -- Completion
  task_completed BOOLEAN,
  completion_time_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_page_performance_session ON page_performance(session_id, page_entered_at);
CREATE INDEX idx_page_performance_url ON page_performance(page_url);
CREATE INDEX idx_scroll_events_session ON scroll_events(session_id, timestamp);
CREATE INDEX idx_click_events_session ON click_events(session_id, timestamp);
CREATE INDEX idx_click_events_rage ON click_events(is_rage_click) WHERE is_rage_click = true;
CREATE INDEX idx_form_interactions_session ON form_interactions(session_id, timestamp);
CREATE INDEX idx_rage_clicks_session ON rage_click_incidents(session_id, timestamp);
CREATE INDEX idx_session_metrics_session ON session_metrics(session_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate session metrics
CREATE OR REPLACE FUNCTION calculate_session_metrics(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_duration INTEGER;
  v_pages_visited INTEGER;
  v_total_clicks INTEGER;
  v_total_scrolls INTEGER;
  v_avg_page_load INTEGER;
  v_rage_clicks INTEGER;
BEGIN
  -- Get session duration
  SELECT EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))::INTEGER
  INTO v_total_duration
  FROM user_interactions
  WHERE session_id = p_session_id;
  
  -- Count pages visited
  SELECT COUNT(DISTINCT page_url)
  INTO v_pages_visited
  FROM page_performance
  WHERE session_id = p_session_id;
  
  -- Count clicks
  SELECT COUNT(*)
  INTO v_total_clicks
  FROM click_events
  WHERE session_id = p_session_id;
  
  -- Count scrolls
  SELECT COUNT(*)
  INTO v_total_scrolls
  FROM scroll_events
  WHERE session_id = p_session_id;
  
  -- Average page load time
  SELECT AVG(page_load_time)::INTEGER
  INTO v_avg_page_load
  FROM page_performance
  WHERE session_id = p_session_id;
  
  -- Count rage clicks
  SELECT COUNT(*)
  INTO v_rage_clicks
  FROM rage_click_incidents
  WHERE session_id = p_session_id;
  
  -- Insert or update metrics
  INSERT INTO session_metrics (
    session_id,
    total_duration_seconds,
    pages_visited,
    total_clicks,
    total_scrolls,
    avg_page_load_time,
    rage_click_count
  ) VALUES (
    p_session_id,
    v_total_duration,
    v_pages_visited,
    v_total_clicks,
    v_total_scrolls,
    v_avg_page_load,
    v_rage_clicks
  )
  ON CONFLICT (session_id) DO UPDATE SET
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    pages_visited = EXCLUDED.pages_visited,
    total_clicks = EXCLUDED.total_clicks,
    total_scrolls = EXCLUDED.total_scrolls,
    avg_page_load_time = EXCLUDED.avg_page_load_time,
    rage_click_count = EXCLUDED.rage_click_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Detect rage clicks from click events
CREATE OR REPLACE FUNCTION detect_rage_clicks(p_session_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rage_count INTEGER := 0;
  v_click RECORD;
  v_recent_clicks RECORD[];
BEGIN
  -- Find clusters of rapid clicks in same area
  FOR v_click IN
    SELECT *
    FROM click_events
    WHERE session_id = p_session_id
    ORDER BY timestamp
  LOOP
    -- Check for clicks within 100px and 2 seconds
    INSERT INTO rage_click_incidents (
      session_id,
      page_url,
      timestamp,
      x,
      y,
      click_count,
      time_window_ms,
      target_element,
      target_selector
    )
    SELECT
      p_session_id,
      v_click.page_url,
      v_click.timestamp,
      v_click.x,
      v_click.y,
      COUNT(*),
      EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))::INTEGER * 1000,
      v_click.target_element,
      v_click.target_selector
    FROM click_events
    WHERE session_id = p_session_id
    AND timestamp BETWEEN v_click.timestamp - INTERVAL '2 seconds' AND v_click.timestamp
    AND ABS(x - v_click.x) < 100
    AND ABS(y - v_click.y) < 100
    GROUP BY session_id
    HAVING COUNT(*) >= 3;
    
    GET DIAGNOSTICS v_rage_count = ROW_COUNT;
  END LOOP;
  
  RETURN v_rage_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE page_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE scroll_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rage_click_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_metrics ENABLE ROW LEVEL SECURITY;

-- Testers can view their own data
CREATE POLICY "Testers can view their own page performance"
ON page_performance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_sessions.id = page_performance.session_id
    AND user_sessions.tester_id = auth.uid()
  )
);

CREATE POLICY "Testers can view their own scroll events"
ON scroll_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_sessions.id = scroll_events.session_id
    AND user_sessions.tester_id = auth.uid()
  )
);

CREATE POLICY "Testers can view their own click events"
ON click_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_sessions.id = click_events.session_id
    AND user_sessions.tester_id = auth.uid()
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE page_performance IS 'Tracks page loading times and time spent on each page';
COMMENT ON TABLE scroll_events IS 'Detailed scroll tracking including depth, velocity, and direction';
COMMENT ON TABLE click_events IS 'Enhanced click tracking with rage click detection';
COMMENT ON TABLE form_interactions IS 'Tracks form field interactions, errors, and abandonment';
COMMENT ON TABLE rage_click_incidents IS 'Detected rage click incidents indicating frustration';
COMMENT ON TABLE session_metrics IS 'Aggregated metrics for entire test session';
COMMENT ON COLUMN page_performance.largest_contentful_paint_time IS 'LCP - Core Web Vital metric';
COMMENT ON COLUMN scroll_events.scroll_depth_percentage IS 'How far down the page user scrolled (0-100%)';
COMMENT ON COLUMN click_events.is_rage_click IS 'Detected as part of rapid clicking pattern';
