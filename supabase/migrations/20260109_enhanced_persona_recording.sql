-- Enhanced Persona Profiling and Session Recording
-- Adds comprehensive demographic fields, disabilities, and recording capabilities

-- ============================================================================
-- ENHANCED PERSONA FIELDS
-- ============================================================================

-- Add comprehensive demographic and accessibility fields to human_testers
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS native_language TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS tech_experience TEXT; -- beginner, intermediate, advanced, expert

-- Disability and accessibility fields
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS visual_impairment TEXT; -- none, mild, moderate, severe, blind
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS hearing_impairment TEXT; -- none, mild, moderate, severe, deaf
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS motor_impairment TEXT; -- none, mild, moderate, severe
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS cognitive_impairment TEXT; -- none, mild, moderate, severe
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS uses_screen_reader BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS uses_magnification BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS uses_voice_control BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS uses_keyboard_only BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS color_blindness TEXT; -- none, protanopia, deuteranopia, tritanopia, monochromacy

-- Device and environment
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS primary_device TEXT; -- desktop, laptop, tablet, mobile
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS screen_size TEXT; -- small, medium, large, extra_large
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS internet_speed TEXT; -- slow, medium, fast
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS browser_preference TEXT; -- chrome, firefox, safari, edge, other

-- Testing preferences
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS preferred_test_types TEXT[]; -- ['usability', 'accessibility', 'mobile', 'checkout', etc.]
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS available_hours TEXT; -- morning, afternoon, evening, night, flexible
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Consent and privacy
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS consent_screen_recording BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS consent_cursor_tracking BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS consent_eye_tracking BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS consent_camera_access BOOLEAN DEFAULT false;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS consent_data_training BOOLEAN DEFAULT false; -- Use data to train AI

-- ============================================================================
-- SESSION RECORDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  tester_id UUID NOT NULL REFERENCES human_testers(id) ON DELETE CASCADE,
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  
  -- Recording metadata
  recording_type TEXT NOT NULL, -- screen, cursor, eye_tracking, full
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  
  -- Storage paths
  screen_recording_url TEXT, -- Video file in Supabase Storage
  cursor_data_url TEXT, -- JSON file with cursor positions
  eye_tracking_data_url TEXT, -- JSON file with gaze data
  interaction_data_url TEXT, -- JSON file with all interactions
  
  -- Recording quality
  video_resolution TEXT, -- 1920x1080, 1280x720, etc.
  frame_rate INTEGER, -- 30, 60 fps
  video_codec TEXT, -- h264, vp9, etc.
  
  -- Analysis results
  analyzed BOOLEAN DEFAULT false,
  analysis_results JSONB, -- Frustration moments, attention heatmap, etc.
  
  -- Privacy
  anonymized BOOLEAN DEFAULT false,
  pii_removed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CURSOR TRACKING DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS cursor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES session_recordings(id) ON DELETE CASCADE,
  
  -- Cursor position
  timestamp TIMESTAMPTZ NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  
  -- Cursor state
  event_type TEXT NOT NULL, -- move, click, scroll, hover, drag
  button TEXT, -- left, right, middle
  scroll_delta_x INTEGER,
  scroll_delta_y INTEGER,
  
  -- Target element
  target_element TEXT,
  target_selector TEXT,
  target_text TEXT,
  
  -- Velocity and acceleration (for bot detection)
  velocity NUMERIC, -- pixels per second
  acceleration NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hypertable for time-series data (if using TimescaleDB)
-- SELECT create_hypertable('cursor_tracking', 'timestamp', if_not_exists => TRUE);

-- ============================================================================
-- EYE TRACKING DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS eye_tracking_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES session_recordings(id) ON DELETE CASCADE,
  
  -- Gaze position
  timestamp TIMESTAMPTZ NOT NULL,
  gaze_x INTEGER NOT NULL, -- Screen coordinates
  gaze_y INTEGER NOT NULL,
  
  -- Eye metrics
  fixation_duration INTEGER, -- milliseconds
  saccade_velocity NUMERIC, -- degrees per second
  pupil_diameter NUMERIC, -- millimeters
  
  -- Confidence
  confidence NUMERIC, -- 0.0-1.0
  
  -- Detected element
  element_looked_at TEXT,
  element_selector TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ATTENTION HEATMAP
-- ============================================================================

CREATE TABLE IF NOT EXISTS attention_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  
  -- Heatmap data
  page_url TEXT NOT NULL,
  screenshot_url TEXT, -- Base screenshot
  heatmap_overlay_url TEXT, -- Generated heatmap image
  
  -- Attention zones (JSON array of hot spots)
  attention_zones JSONB, -- [{ x, y, width, height, intensity, duration }]
  
  -- Analysis
  most_viewed_elements TEXT[],
  ignored_elements TEXT[],
  confusion_areas TEXT[], -- Areas with erratic eye movement
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FRUSTRATION MOMENTS (Enhanced from VideoAnalyzer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS frustration_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES session_recordings(id) ON DELETE CASCADE,
  
  -- Moment details
  timestamp TIMESTAMPTZ NOT NULL,
  video_timestamp_seconds NUMERIC, -- Position in video
  
  -- Frustration type
  frustration_type TEXT NOT NULL, -- rage_click, long_pause, cursor_confusion, back_navigation, form_abandonment
  severity TEXT NOT NULL, -- low, medium, high, critical
  
  -- Context
  page_url TEXT,
  element TEXT,
  element_selector TEXT,
  screenshot_url TEXT,
  
  -- Metrics
  click_count INTEGER, -- For rage clicks
  pause_duration INTEGER, -- For long pauses
  cursor_distance NUMERIC, -- For cursor confusion
  
  -- Analysis
  likely_cause TEXT,
  recommendation TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERSONA GENERATION FROM RECORDINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS persona_from_tester (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES human_testers(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  
  -- Mapping
  created_from_sessions UUID[], -- Array of session IDs used to create persona
  confidence_score NUMERIC, -- How well the persona represents the tester
  
  -- Behavioral patterns extracted
  behavior_summary JSONB, -- Key behaviors observed
  attention_patterns JSONB, -- Where they focus
  interaction_style JSONB, -- How they interact
  
  -- AI training
  used_for_training BOOLEAN DEFAULT false,
  training_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX idx_session_recordings_tester ON session_recordings(tester_id);
CREATE INDEX idx_cursor_tracking_session ON cursor_tracking(session_id, timestamp);
CREATE INDEX idx_eye_tracking_session ON eye_tracking_data(session_id, timestamp);
CREATE INDEX idx_attention_heatmap_session ON attention_heatmap(session_id);
CREATE INDEX idx_frustration_moments_session ON frustration_moments(session_id, timestamp);
CREATE INDEX idx_persona_from_tester_tester ON persona_from_tester(tester_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Session recordings: Testers can view their own, companies can view their tests
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can view their own recordings"
ON session_recordings FOR SELECT
USING (tester_id = auth.uid());

CREATE POLICY "Companies can view recordings from their tests"
ON session_recordings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_requests
    WHERE test_requests.id = session_recordings.test_request_id
    AND is_member_of_company(test_requests.company_id)
  )
);

-- Cursor tracking: Same as recordings
ALTER TABLE cursor_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can view their own cursor data"
ON cursor_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_sessions.id = cursor_tracking.session_id
    AND user_sessions.tester_id = auth.uid()
  )
);

-- Eye tracking: Same as recordings
ALTER TABLE eye_tracking_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can view their own eye tracking data"
ON eye_tracking_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_sessions.id = eye_tracking_data.session_id
    AND user_sessions.tester_id = auth.uid()
  )
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate attention heatmap from eye tracking data
CREATE OR REPLACE FUNCTION generate_attention_heatmap(p_session_id UUID)
RETURNS UUID AS $$
DECLARE
  v_heatmap_id UUID;
  v_zones JSONB;
BEGIN
  -- Aggregate eye tracking data into zones
  SELECT jsonb_agg(
    jsonb_build_object(
      'x', FLOOR(gaze_x / 50) * 50,
      'y', FLOOR(gaze_y / 50) * 50,
      'intensity', COUNT(*),
      'avg_fixation', AVG(fixation_duration)
    )
  ) INTO v_zones
  FROM eye_tracking_data
  WHERE session_id = p_session_id
  GROUP BY FLOOR(gaze_x / 50), FLOOR(gaze_y / 50);
  
  -- Insert heatmap
  INSERT INTO attention_heatmap (session_id, attention_zones)
  VALUES (p_session_id, v_zones)
  RETURNING id INTO v_heatmap_id;
  
  RETURN v_heatmap_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE session_recordings IS 'Stores screen recordings, cursor tracking, and eye tracking data from human testers';
COMMENT ON TABLE cursor_tracking IS 'High-frequency cursor position and interaction data';
COMMENT ON TABLE eye_tracking_data IS 'Eye gaze tracking data captured via webcam';
COMMENT ON TABLE attention_heatmap IS 'Aggregated attention data showing where users focus';
COMMENT ON TABLE frustration_moments IS 'Detected moments of user frustration during testing';
COMMENT ON TABLE persona_from_tester IS 'Maps human testers to generated personas for AI training';
COMMENT ON COLUMN human_testers.consent_eye_tracking IS 'User consent for webcam-based eye tracking';
COMMENT ON COLUMN human_testers.consent_data_training IS 'User consent to use their data for training AI testers';
