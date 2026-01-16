-- Migration: Milestone Tracking System
-- Purpose: Track progress toward phase unlocks (1k, 5k, 10k tests)

-- Create platform_milestones table
CREATE TABLE IF NOT EXISTS platform_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('test_count', 'quality_threshold', 'revenue', 'infrastructure')),
  target_value BIGINT NOT NULL,
  current_value BIGINT DEFAULT 0,
  unlock_phase TEXT CHECK (unlock_phase IN ('phase2', 'phase3', 'phase4')),
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_milestones_phase ON platform_milestones(unlock_phase);
CREATE INDEX idx_milestones_unlocked ON platform_milestones(is_unlocked);

-- Insert initial milestones for Phase 2 (1,000 tests)
INSERT INTO platform_milestones (milestone_name, milestone_type, target_value, unlock_phase) VALUES
  ('Total Tests Completed', 'test_count', 1000, 'phase2'),
  ('High Quality Tests (4+ stars)', 'test_count', 500, 'phase2'),
  ('Human Verified Tests', 'test_count', 300, 'phase2'),
  ('Training Batch Ready', 'test_count', 50, 'phase2');

-- Insert milestones for Phase 3 (5,000 tests)
INSERT INTO platform_milestones (milestone_name, milestone_type, target_value, unlock_phase) VALUES
  ('Phase 3 Test Count', 'test_count', 5000, 'phase3'),
  ('Phase 3 Quality Tests', 'test_count', 2500, 'phase3'),
  ('Phase 3 Monthly Revenue', 'revenue', 50000, 'phase3'),
  ('Fine-Tuned Models Deployed', 'infrastructure', 3, 'phase3');

-- Insert milestones for Phase 4 (10,000 tests)
INSERT INTO platform_milestones (milestone_name, milestone_type, target_value, unlock_phase) VALUES
  ('Phase 4 Test Count', 'test_count', 10000, 'phase4'),
  ('Phase 4 Quality Tests', 'test_count', 5000, 'phase4'),
  ('Phase 4 Monthly Revenue', 'revenue', 100000, 'phase4'),
  ('Self-Hosted Infrastructure', 'infrastructure', 1, 'phase4');

-- Function to update milestone progress
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS void AS $$
BEGIN
  -- Update total tests completed
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed'
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Total Tests Completed';
  
  -- Update high quality tests (4+ star rating)
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed' 
    AND company_ai_rating >= 4
  ),
  updated_at = NOW()
  WHERE milestone_name = 'High Quality Tests (4+ stars)';
  
  -- Update Phase 3 test count
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed'
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Phase 3 Test Count';
  
  -- Update Phase 4 test count
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed'
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Phase 4 Test Count';
  
  -- Update Phase 3 quality tests
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed' 
    AND company_ai_rating >= 4
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Phase 3 Quality Tests';
  
  -- Update Phase 4 quality tests
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM test_runs 
    WHERE status = 'completed' 
    AND company_ai_rating >= 4
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Phase 4 Quality Tests';
  
  -- Check for unlocks and update status
  UPDATE platform_milestones
  SET is_unlocked = TRUE, 
      unlocked_at = NOW(),
      updated_at = NOW()
  WHERE current_value >= target_value 
  AND is_unlocked = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update milestones after test completion
CREATE OR REPLACE FUNCTION trigger_milestone_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_milestone_progress();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on test_runs
DROP TRIGGER IF EXISTS after_test_completion ON test_runs;
CREATE TRIGGER after_test_completion
  AFTER INSERT OR UPDATE ON test_runs
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trigger_milestone_update();

-- View for phase unlock status
CREATE OR REPLACE VIEW phase_unlock_status AS
SELECT 
  unlock_phase,
  BOOL_AND(is_unlocked) as phase_unlocked,
  MIN(unlocked_at) as unlocked_at,
  jsonb_agg(jsonb_build_object(
    'milestone', milestone_name,
    'current', current_value,
    'target', target_value,
    'progress', ROUND((current_value::DECIMAL / NULLIF(target_value, 0)) * 100, 1),
    'unlocked', is_unlocked
  ) ORDER BY target_value) as milestones
FROM platform_milestones
WHERE unlock_phase IS NOT NULL
GROUP BY unlock_phase;

-- Function to get current phase
CREATE OR REPLACE FUNCTION get_current_phase()
RETURNS TEXT AS $$
DECLARE
  current_phase TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT unlock_phase 
     FROM phase_unlock_status 
     WHERE phase_unlocked = TRUE 
     ORDER BY unlock_phase DESC 
     LIMIT 1),
    'phase1'
  ) INTO current_phase;
  
  RETURN current_phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE platform_milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read milestones
CREATE POLICY "Anyone can view milestones"
  ON platform_milestones
  FOR SELECT
  USING (true);

-- Policy: Only service role can update milestones
CREATE POLICY "Only service role can update milestones"
  ON platform_milestones
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Initial progress update
SELECT update_milestone_progress();
