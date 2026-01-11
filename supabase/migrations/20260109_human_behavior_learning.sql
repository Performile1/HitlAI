-- Human Behavior Learning System
-- Captures real user sessions to refine personas and discover friction

-- Session Recordings Table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  user_agent TEXT,
  viewport_width INT,
  viewport_height INT,
  device_type TEXT, -- desktop, mobile, tablet
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  
  -- Anonymized user characteristics (for persona matching)
  estimated_age_range TEXT, -- e.g., "18-25", "65+"
  estimated_tech_literacy TEXT, -- low, medium, high
  
  -- Session metadata
  total_clicks INT DEFAULT 0,
  total_scrolls INT DEFAULT 0,
  total_errors INT DEFAULT 0,
  total_hesitations INT DEFAULT 0, -- pauses > 3 seconds
  completion_status TEXT, -- completed, abandoned, error
  
  -- Privacy
  anonymized BOOLEAN DEFAULT TRUE,
  consent_given BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_url ON user_sessions(url);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at DESC);
CREATE INDEX idx_user_sessions_completion_status ON user_sessions(completion_status);

-- User Interactions Table (granular event tracking)
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- click, scroll, input, error, hesitation, rage_click
  timestamp_ms BIGINT NOT NULL, -- milliseconds since session start
  
  -- Element details
  element_selector TEXT,
  element_text TEXT,
  element_type TEXT, -- button, link, input, etc.
  
  -- Interaction context
  mouse_x INT,
  mouse_y INT,
  scroll_depth INT, -- percentage
  input_value TEXT, -- sanitized/hashed for privacy
  
  -- Friction indicators
  is_error BOOLEAN DEFAULT FALSE,
  is_hesitation BOOLEAN DEFAULT FALSE, -- pause > 3 seconds
  is_rage_click BOOLEAN DEFAULT FALSE, -- rapid repeated clicks
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_interactions_session ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_event_type ON user_interactions(event_type);
CREATE INDEX idx_user_interactions_is_error ON user_interactions(is_error) WHERE is_error = TRUE;

-- Behavior Patterns Table (extracted insights)
CREATE TABLE behavior_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pattern identification
  pattern_type TEXT NOT NULL, -- common_friction, navigation_flow, error_recovery, etc.
  pattern_name TEXT NOT NULL,
  description TEXT,
  
  -- Occurrence data
  url_pattern TEXT, -- e.g., "/checkout/*"
  element_pattern TEXT, -- e.g., "button[type='submit']"
  frequency INT DEFAULT 1, -- how many times observed
  
  -- User characteristics (aggregated)
  age_range TEXT,
  tech_literacy TEXT,
  device_type TEXT,
  
  -- Pattern details
  typical_sequence JSONB, -- array of event types
  avg_duration_seconds FLOAT,
  success_rate FLOAT, -- 0.0 to 1.0
  
  -- Friction indicators
  friction_score FLOAT, -- 0.0 (smooth) to 1.0 (high friction)
  common_errors JSONB, -- array of error messages
  
  -- Learning metadata
  confidence_score FLOAT, -- 0.0 to 1.0 (based on sample size)
  sample_size INT, -- number of sessions contributing to pattern
  last_observed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_behavior_patterns_pattern_type ON behavior_patterns(pattern_type);
CREATE INDEX idx_behavior_patterns_url_pattern ON behavior_patterns(url_pattern);
CREATE INDEX idx_behavior_patterns_friction_score ON behavior_patterns(friction_score DESC);

-- Persona Refinements Table (track how personas evolve)
CREATE TABLE persona_refinements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  
  -- What changed
  refinement_type TEXT NOT NULL, -- attention_rules, cognitive_load, navigation_preference, etc.
  old_value JSONB,
  new_value JSONB,
  
  -- Why it changed
  reason TEXT, -- e.g., "Observed 50 sessions where seniors struggled with hidden menus"
  evidence_sessions INT, -- number of sessions supporting this change
  confidence_score FLOAT, -- 0.0 to 1.0
  
  -- Source data
  behavior_pattern_ids UUID[], -- patterns that triggered this refinement
  
  -- Approval workflow
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_refinements_persona ON persona_refinements(persona_id);
CREATE INDEX idx_persona_refinements_status ON persona_refinements(status);

-- Friction Heatmap Table (aggregate friction by page/element)
CREATE TABLE friction_heatmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  url TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  
  -- Aggregated metrics
  total_interactions INT DEFAULT 0,
  error_count INT DEFAULT 0,
  hesitation_count INT DEFAULT 0,
  rage_click_count INT DEFAULT 0,
  
  -- Friction score (0.0 to 1.0)
  friction_score FLOAT,
  
  -- User segments
  by_age_range JSONB, -- {"18-25": 0.2, "65+": 0.8}
  by_tech_literacy JSONB, -- {"low": 0.9, "high": 0.1}
  by_device JSONB, -- {"mobile": 0.7, "desktop": 0.3}
  
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(url, element_selector)
);

CREATE INDEX idx_friction_heatmap_url ON friction_heatmap(url);
CREATE INDEX idx_friction_heatmap_friction_score ON friction_heatmap(friction_score DESC);

-- Function to update friction heatmap
CREATE OR REPLACE FUNCTION update_friction_heatmap()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO friction_heatmap (url, element_selector, total_interactions, error_count, hesitation_count, rage_click_count)
  SELECT 
    s.url,
    i.element_selector,
    COUNT(*) as total_interactions,
    SUM(CASE WHEN i.is_error THEN 1 ELSE 0 END) as error_count,
    SUM(CASE WHEN i.is_hesitation THEN 1 ELSE 0 END) as hesitation_count,
    SUM(CASE WHEN i.is_rage_click THEN 1 ELSE 0 END) as rage_click_count
  FROM user_interactions i
  JOIN user_sessions s ON s.id = i.session_id
  WHERE i.id = NEW.id
  GROUP BY s.url, i.element_selector
  ON CONFLICT (url, element_selector) DO UPDATE SET
    total_interactions = friction_heatmap.total_interactions + EXCLUDED.total_interactions,
    error_count = friction_heatmap.error_count + EXCLUDED.error_count,
    hesitation_count = friction_heatmap.hesitation_count + EXCLUDED.hesitation_count,
    rage_click_count = friction_heatmap.rage_click_count + EXCLUDED.rage_click_count,
    friction_score = (
      (EXCLUDED.error_count * 1.0 + EXCLUDED.hesitation_count * 0.5 + EXCLUDED.rage_click_count * 0.8) / 
      NULLIF(EXCLUDED.total_interactions, 0)
    ),
    last_updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update friction heatmap
CREATE TRIGGER update_friction_heatmap_trigger
  AFTER INSERT ON user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_friction_heatmap();

-- Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_refinements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_heatmap ENABLE ROW LEVEL SECURITY;

-- Policies (all data is anonymized, so readable by authenticated users)
CREATE POLICY "Authenticated users can view sessions"
  ON user_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view interactions"
  ON user_interactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert interactions"
  ON user_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view patterns"
  ON behavior_patterns FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage patterns"
  ON behavior_patterns FOR ALL
  USING (true);

CREATE POLICY "Users can view refinements for their personas"
  ON persona_refinements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM personas
    WHERE personas.id = persona_refinements.persona_id
    AND (personas.user_id = auth.uid() OR personas.is_public = TRUE)
  ));

CREATE POLICY "System can create refinements"
  ON persona_refinements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can approve/reject refinements for their personas"
  ON persona_refinements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM personas
    WHERE personas.id = persona_refinements.persona_id
    AND personas.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can view friction heatmap"
  ON friction_heatmap FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage friction heatmap"
  ON friction_heatmap FOR ALL
  USING (true);

-- Comments
COMMENT ON TABLE user_sessions IS 'Anonymized recordings of real user sessions for behavior analysis';
COMMENT ON TABLE user_interactions IS 'Granular event tracking within user sessions (clicks, scrolls, errors)';
COMMENT ON TABLE behavior_patterns IS 'Extracted patterns from user sessions (common friction points, navigation flows)';
COMMENT ON TABLE persona_refinements IS 'Proposed updates to personas based on real user behavior';
COMMENT ON TABLE friction_heatmap IS 'Aggregated friction scores by URL and element for visualization';
