-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE test_status AS ENUM ('pending', 'running', 'hitl_paused', 'completed', 'failed');
CREATE TYPE platform_type AS ENUM ('web', 'mobile');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Test Runs Table
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  persona TEXT NOT NULL,
  platform platform_type NOT NULL,
  status test_status NOT NULL DEFAULT 'pending',
  current_step_index INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  sentiment_score FLOAT CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  crawl_context TEXT,
  semantic_schema JSONB,
  audit_results JSONB,
  final_report TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_created_at ON test_runs(created_at DESC);

-- Friction Points Table
CREATE TABLE friction_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  element TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity severity_level NOT NULL,
  persona_impact TEXT,
  resolution TEXT,
  platform platform_type NOT NULL,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_friction_points_test_run ON friction_points(test_run_id);
CREATE INDEX idx_friction_points_severity ON friction_points(severity);

-- HitlAI Cloud Database Schema (with vector embeddings)
CREATE TABLE memory_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_text TEXT NOT NULL,
  url TEXT NOT NULL,
  platform platform_type NOT NULL,
  friction_type TEXT NOT NULL,
  resolution TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_memory_lessons_embedding ON memory_lessons USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_memory_lessons_url ON memory_lessons(url);
CREATE INDEX idx_memory_lessons_platform ON memory_lessons(platform);
CREATE INDEX idx_memory_lessons_created_at ON memory_lessons(created_at DESC);

-- Personas Table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  age INT CHECK (age > 0 AND age < 120),
  tech_literacy TEXT NOT NULL,
  eyesight TEXT NOT NULL,
  attention_rules JSONB DEFAULT '[]',
  cognitive_load TEXT NOT NULL,
  preferred_navigation TEXT NOT NULL,
  reading_level TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_personas_is_default ON personas(is_default) WHERE is_default = TRUE;

-- Action Attempts Table
CREATE TABLE action_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  action_type TEXT NOT NULL,
  selector TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  screenshot_url TEXT,
  execution_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_attempts_test_run ON action_attempts(test_run_id);
CREATE INDEX idx_action_attempts_created_at ON action_attempts(created_at DESC);

-- Mission Steps Table
CREATE TABLE mission_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  action TEXT NOT NULL,
  target_element TEXT,
  validation TEXT,
  cognitive_notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mission_steps_test_run ON mission_steps(test_run_id);

-- HITL Feedback Table
CREATE TABLE hitl_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  provided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hitl_feedback_test_run ON hitl_feedback(test_run_id);

-- Insert default personas
INSERT INTO personas (name, age, tech_literacy, eyesight, attention_rules, cognitive_load, preferred_navigation, reading_level, is_default, is_public) VALUES
('senior_casual', 70, 'low', 'low_contrast_sensitive', 
 '["Avoid hidden menus", "Click text labels over icons", "Prefer large touch targets (min 44x44px)", "Avoid rapid animations"]'::jsonb,
 'low', 'linear', 'simple', TRUE, TRUE),

('young_power_user', 25, 'high', 'normal',
 '["Keyboard shortcuts preferred", "Dense information acceptable", "Quick animations tolerated"]'::jsonb,
 'high', 'non-linear', 'technical', TRUE, TRUE),

('middle_age_moderate', 45, 'medium', 'mild_presbyopia',
 '["Clear visual hierarchy needed", "Moderate information density", "Consistent UI patterns"]'::jsonb,
 'medium', 'mixed', 'intermediate', TRUE, TRUE),

('accessibility_focused', 60, 'medium', 'screen_reader_dependent',
 '["All actions must have ARIA labels", "Semantic HTML required", "Keyboard navigation essential", "Focus indicators must be visible"]'::jsonb,
 'medium', 'keyboard_only', 'simple', TRUE, TRUE);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to test_runs
CREATE TRIGGER update_test_runs_updated_at
  BEFORE UPDATE ON test_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitl_feedback ENABLE ROW LEVEL SECURITY;

-- Test Runs Policies
CREATE POLICY "Users can view their own test runs"
  ON test_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create test runs"
  ON test_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test runs"
  ON test_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Friction Points Policies
CREATE POLICY "Users can view friction points for their tests"
  ON friction_points FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = friction_points.test_run_id
    AND test_runs.user_id = auth.uid()
  ));

CREATE POLICY "System can insert friction points"
  ON friction_points FOR INSERT
  WITH CHECK (true);

-- Memory Lessons Policies
CREATE POLICY "Users can view all public lessons"
  ON memory_lessons FOR SELECT
  USING (true);

CREATE POLICY "Users can create lessons"
  ON memory_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Personas Policies
CREATE POLICY "Users can view public and own personas"
  ON personas FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create their own personas"
  ON personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE
  USING (auth.uid() = user_id);

-- Action Attempts Policies
CREATE POLICY "Users can view attempts for their tests"
  ON action_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = action_attempts.test_run_id
    AND test_runs.user_id = auth.uid()
  ));

CREATE POLICY "System can insert action attempts"
  ON action_attempts FOR INSERT
  WITH CHECK (true);

-- Mission Steps Policies
CREATE POLICY "Users can view steps for their tests"
  ON mission_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = mission_steps.test_run_id
    AND test_runs.user_id = auth.uid()
  ));

CREATE POLICY "System can manage mission steps"
  ON mission_steps FOR ALL
  USING (true);

-- HITL Feedback Policies
CREATE POLICY "Users can view feedback for their tests"
  ON hitl_feedback FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = hitl_feedback.test_run_id
    AND test_runs.user_id = auth.uid()
  ));

CREATE POLICY "Users can provide feedback"
  ON hitl_feedback FOR INSERT
  WITH CHECK (auth.uid() = provided_by);

-- Create vector search function
CREATE OR REPLACE FUNCTION match_memory_lessons(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_platform text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  lesson_text text,
  url text,
  platform platform_type,
  friction_type text,
  resolution text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memory_lessons.id,
    memory_lessons.lesson_text,
    memory_lessons.url,
    memory_lessons.platform,
    memory_lessons.friction_type,
    memory_lessons.resolution,
    memory_lessons.metadata,
    1 - (memory_lessons.embedding <=> query_embedding) AS similarity
  FROM memory_lessons
  WHERE 
    (filter_platform IS NULL OR memory_lessons.platform::text = filter_platform)
    AND 1 - (memory_lessons.embedding <=> query_embedding) > match_threshold
  ORDER BY memory_lessons.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get test statistics
CREATE OR REPLACE FUNCTION get_test_statistics(user_uuid uuid)
RETURNS TABLE (
  total_tests bigint,
  completed_tests bigint,
  failed_tests bigint,
  avg_sentiment_score float,
  total_friction_points bigint,
  hitl_interventions bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS total_tests,
    COUNT(*) FILTER (WHERE status = 'completed')::bigint AS completed_tests,
    COUNT(*) FILTER (WHERE status = 'failed')::bigint AS failed_tests,
    AVG(sentiment_score) AS avg_sentiment_score,
    (SELECT COUNT(*) FROM friction_points fp 
     JOIN test_runs tr ON fp.test_run_id = tr.id 
     WHERE tr.user_id = user_uuid)::bigint AS total_friction_points,
    (SELECT COUNT(*) FROM hitl_feedback hf
     JOIN test_runs tr ON hf.test_run_id = tr.id
     WHERE tr.user_id = user_uuid)::bigint AS hitl_interventions
  FROM test_runs
  WHERE user_id = user_uuid;
END;
$$;
