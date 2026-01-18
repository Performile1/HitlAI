-- Migration: Enhanced Session Recording Infrastructure
-- Description: Tables for detailed session recording, interactions, and performance tracking
-- Created: 2026-01-17

-- =====================================================
-- 1. PAGE PERFORMANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS page_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  
  -- Page info
  url TEXT NOT NULL,
  page_title TEXT,
  
  -- Performance metrics
  dom_content_loaded_ms INTEGER,
  load_complete_ms INTEGER,
  first_paint_ms INTEGER,
  first_contentful_paint_ms INTEGER,
  largest_contentful_paint_ms INTEGER,
  time_to_interactive_ms INTEGER,
  
  -- Resource metrics
  total_resources INTEGER,
  total_size_bytes BIGINT,
  js_size_bytes BIGINT,
  css_size_bytes BIGINT,
  image_size_bytes BIGINT,
  
  -- Timing
  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  time_on_page_seconds INTEGER,
  visible_time_seconds INTEGER,
  hidden_time_seconds INTEGER,
  
  -- Exit
  exit_type TEXT, -- 'navigation', 'close', 'refresh', 'timeout'
  
  -- Metadata
  viewport_width INTEGER,
  viewport_height INTEGER,
  device_pixel_ratio DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_performance_session ON page_performance(user_session_id);
CREATE INDEX idx_page_performance_test_run ON page_performance(test_run_id);
CREATE INDEX idx_page_performance_url ON page_performance(url);
CREATE INDEX idx_page_performance_lcp ON page_performance(largest_contentful_paint_ms);
CREATE INDEX idx_page_performance_created_at ON page_performance(created_at DESC);

-- =====================================================
-- 2. SCROLL EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS scroll_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Scroll position
  scroll_x INTEGER NOT NULL,
  scroll_y INTEGER NOT NULL,
  scroll_depth_percent DECIMAL(5,2),
  
  -- Viewport
  viewport_height INTEGER NOT NULL,
  document_height INTEGER NOT NULL,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  time_since_page_load_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scroll_events_session ON scroll_events(user_session_id);
CREATE INDEX idx_scroll_events_test_run ON scroll_events(test_run_id);
CREATE INDEX idx_scroll_events_page ON scroll_events(page_performance_id);
CREATE INDEX idx_scroll_events_timestamp ON scroll_events(timestamp_ms);

-- =====================================================
-- 3. CLICK EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Click details
  element_tag TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  element_selector TEXT,
  
  -- Position
  click_x INTEGER NOT NULL,
  click_y INTEGER NOT NULL,
  viewport_x INTEGER,
  viewport_y INTEGER,
  
  -- Click type
  button INTEGER, -- 0=left, 1=middle, 2=right
  is_double_click BOOLEAN DEFAULT FALSE,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  time_since_page_load_ms INTEGER,
  time_since_last_click_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_click_events_session ON click_events(user_session_id);
CREATE INDEX idx_click_events_test_run ON click_events(test_run_id);
CREATE INDEX idx_click_events_page ON click_events(page_performance_id);
CREATE INDEX idx_click_events_element ON click_events(element_tag, element_id);
CREATE INDEX idx_click_events_timestamp ON click_events(timestamp_ms);

-- =====================================================
-- 4. FORM INTERACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS form_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Form details
  form_id TEXT,
  form_name TEXT,
  form_action TEXT,
  
  -- Field details
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_label TEXT,
  
  -- Interaction
  interaction_type TEXT NOT NULL, -- 'focus', 'blur', 'input', 'change', 'submit'
  field_value_length INTEGER, -- Length only, not actual value for privacy
  
  -- Validation
  is_valid BOOLEAN,
  validation_message TEXT,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  time_in_field_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_interactions_session ON form_interactions(user_session_id);
CREATE INDEX idx_form_interactions_test_run ON form_interactions(test_run_id);
CREATE INDEX idx_form_interactions_page ON form_interactions(page_performance_id);
CREATE INDEX idx_form_interactions_type ON form_interactions(interaction_type);
CREATE INDEX idx_form_interactions_timestamp ON form_interactions(timestamp_ms);

-- =====================================================
-- 5. RAGE CLICK INCIDENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS rage_click_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Incident details
  click_count INTEGER NOT NULL,
  time_span_ms INTEGER NOT NULL,
  
  -- Element
  element_tag TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  element_selector TEXT,
  
  -- Position
  area_x INTEGER NOT NULL,
  area_y INTEGER NOT NULL,
  area_radius INTEGER NOT NULL,
  
  -- Context
  likely_cause TEXT, -- 'unresponsive_button', 'broken_link', 'slow_response', 'unclear_ui'
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  
  -- Related clicks
  click_event_ids UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rage_click_incidents_session ON rage_click_incidents(user_session_id);
CREATE INDEX idx_rage_click_incidents_test_run ON rage_click_incidents(test_run_id);
CREATE INDEX idx_rage_click_incidents_page ON rage_click_incidents(page_performance_id);
CREATE INDEX idx_rage_click_incidents_element ON rage_click_incidents(element_selector);
CREATE INDEX idx_rage_click_incidents_created_at ON rage_click_incidents(created_at DESC);

-- =====================================================
-- 6. MOUSE MOVEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS mouse_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Movement data (sampled, not every pixel)
  positions JSONB NOT NULL, -- Array of {x, y, timestamp}
  
  -- Metrics
  total_distance_pixels INTEGER,
  avg_speed_pixels_per_second DECIMAL(8,2),
  max_speed_pixels_per_second DECIMAL(8,2),
  
  -- Pattern detection
  is_smooth BOOLEAN,
  has_hesitation BOOLEAN,
  hesitation_count INTEGER,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mouse_movements_session ON mouse_movements(user_session_id);
CREATE INDEX idx_mouse_movements_test_run ON mouse_movements(test_run_id);
CREATE INDEX idx_mouse_movements_page ON mouse_movements(page_performance_id);
CREATE INDEX idx_mouse_movements_created_at ON mouse_movements(created_at DESC);

-- =====================================================
-- 7. KEYBOARD EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS keyboard_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'keydown', 'keyup', 'keypress'
  key_code INTEGER,
  key_name TEXT,
  
  -- Modifiers
  ctrl_key BOOLEAN DEFAULT FALSE,
  alt_key BOOLEAN DEFAULT FALSE,
  shift_key BOOLEAN DEFAULT FALSE,
  meta_key BOOLEAN DEFAULT FALSE,
  
  -- Context
  target_element TEXT,
  is_in_form BOOLEAN DEFAULT FALSE,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  time_since_last_key_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyboard_events_session ON keyboard_events(user_session_id);
CREATE INDEX idx_keyboard_events_test_run ON keyboard_events(test_run_id);
CREATE INDEX idx_keyboard_events_page ON keyboard_events(page_performance_id);
CREATE INDEX idx_keyboard_events_timestamp ON keyboard_events(timestamp_ms);

-- =====================================================
-- 8. VISIBILITY CHANGES
-- =====================================================

CREATE TABLE IF NOT EXISTS visibility_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Visibility
  became_visible BOOLEAN NOT NULL,
  visibility_state TEXT NOT NULL, -- 'visible', 'hidden', 'prerender'
  
  -- Duration (if becoming hidden, how long was it visible)
  duration_visible_ms INTEGER,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visibility_changes_session ON visibility_changes(user_session_id);
CREATE INDEX idx_visibility_changes_test_run ON visibility_changes(test_run_id);
CREATE INDEX idx_visibility_changes_page ON visibility_changes(page_performance_id);
CREATE INDEX idx_visibility_changes_timestamp ON visibility_changes(timestamp_ms);

-- =====================================================
-- 9. NETWORK REQUESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS network_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Request details
  url TEXT NOT NULL,
  method TEXT NOT NULL,
  request_type TEXT, -- 'xhr', 'fetch', 'script', 'stylesheet', 'image', 'font', 'document'
  
  -- Response
  status_code INTEGER,
  response_size_bytes INTEGER,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Performance
  dns_lookup_ms INTEGER,
  tcp_connect_ms INTEGER,
  tls_handshake_ms INTEGER,
  time_to_first_byte_ms INTEGER,
  download_ms INTEGER,
  
  -- Status
  success BOOLEAN,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_network_requests_session ON network_requests(user_session_id);
CREATE INDEX idx_network_requests_test_run ON network_requests(test_run_id);
CREATE INDEX idx_network_requests_page ON network_requests(page_performance_id);
CREATE INDEX idx_network_requests_type ON network_requests(request_type);
CREATE INDEX idx_network_requests_failed ON network_requests(success) WHERE success = FALSE;
CREATE INDEX idx_network_requests_slow ON network_requests(duration_ms DESC) WHERE duration_ms > 1000;

-- =====================================================
-- 10. CONSOLE LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS console_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Log details
  log_level TEXT NOT NULL, -- 'log', 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  
  -- Context
  source_file TEXT,
  line_number INTEGER,
  column_number INTEGER,
  stack_trace TEXT,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_console_logs_session ON console_logs(user_session_id);
CREATE INDEX idx_console_logs_test_run ON console_logs(test_run_id);
CREATE INDEX idx_console_logs_page ON console_logs(page_performance_id);
CREATE INDEX idx_console_logs_level ON console_logs(log_level);
CREATE INDEX idx_console_logs_errors ON console_logs(log_level) WHERE log_level = 'error';
CREATE INDEX idx_console_logs_timestamp ON console_logs(timestamp_ms);

-- =====================================================
-- 11. JAVASCRIPT ERRORS
-- =====================================================

CREATE TABLE IF NOT EXISTS javascript_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Error details
  error_message TEXT NOT NULL,
  error_type TEXT, -- 'TypeError', 'ReferenceError', 'SyntaxError', etc.
  
  -- Source
  source_file TEXT,
  line_number INTEGER,
  column_number INTEGER,
  stack_trace TEXT,
  
  -- Context
  user_agent TEXT,
  url TEXT NOT NULL,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_javascript_errors_session ON javascript_errors(user_session_id);
CREATE INDEX idx_javascript_errors_test_run ON javascript_errors(test_run_id);
CREATE INDEX idx_javascript_errors_page ON javascript_errors(page_performance_id);
CREATE INDEX idx_javascript_errors_type ON javascript_errors(error_type);
CREATE INDEX idx_javascript_errors_created_at ON javascript_errors(created_at DESC);

-- =====================================================
-- 12. ELEMENT VISIBILITY TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS element_visibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session context
  user_session_id UUID,
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  page_performance_id UUID REFERENCES page_performance(id) ON DELETE CASCADE,
  
  -- Element
  element_selector TEXT NOT NULL,
  element_text TEXT,
  element_type TEXT, -- 'button', 'link', 'image', 'form', 'heading', etc.
  
  -- Visibility
  became_visible BOOLEAN NOT NULL,
  visibility_percent DECIMAL(5,2), -- How much of element is visible
  
  -- Position
  element_x INTEGER,
  element_y INTEGER,
  element_width INTEGER,
  element_height INTEGER,
  
  -- Timing
  timestamp_ms BIGINT NOT NULL,
  time_visible_ms INTEGER, -- If becoming invisible, how long was it visible
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_element_visibility_session ON element_visibility(user_session_id);
CREATE INDEX idx_element_visibility_test_run ON element_visibility(test_run_id);
CREATE INDEX idx_element_visibility_page ON element_visibility(page_performance_id);
CREATE INDEX idx_element_visibility_selector ON element_visibility(element_selector);
CREATE INDEX idx_element_visibility_timestamp ON element_visibility(timestamp_ms);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE page_performance IS 'Tracks page load performance metrics and Core Web Vitals';
COMMENT ON TABLE scroll_events IS 'Records scroll position changes for heatmap generation';
COMMENT ON TABLE click_events IS 'Captures all click events with element details';
COMMENT ON TABLE form_interactions IS 'Tracks form field interactions without capturing sensitive data';
COMMENT ON TABLE rage_click_incidents IS 'Detects rage clicking indicating UX frustration';
COMMENT ON TABLE mouse_movements IS 'Sampled mouse movement data for pattern analysis';
COMMENT ON TABLE keyboard_events IS 'Keyboard interaction tracking';
COMMENT ON TABLE visibility_changes IS 'Tracks when page becomes visible/hidden';
COMMENT ON TABLE network_requests IS 'Monitors network requests and performance';
COMMENT ON TABLE console_logs IS 'Captures browser console logs';
COMMENT ON TABLE javascript_errors IS 'Records JavaScript errors for debugging';
COMMENT ON TABLE element_visibility IS 'Tracks when specific elements become visible';
