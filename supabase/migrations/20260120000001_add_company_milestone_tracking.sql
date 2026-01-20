-- Migration: Add Company-Specific Milestone Tracking
-- Purpose: Track milestone progress per company (not just globally)
-- Date: 2026-01-20

-- Create milestone_progress table (per company)
CREATE TABLE IF NOT EXISTS milestone_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_tests_completed INTEGER DEFAULT 0,
  tests_last_30_days INTEGER DEFAULT 0,
  high_quality_tests INTEGER DEFAULT 0,
  current_phase TEXT DEFAULT 'phase1' CHECK (current_phase IN ('phase1', 'phase2', 'phase3', 'phase4')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Create unlocked_features table (per company)
CREATE TABLE IF NOT EXISTS unlocked_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, feature_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_milestone_progress_company ON milestone_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_milestone_progress_phase ON milestone_progress(current_phase);
CREATE INDEX IF NOT EXISTS idx_unlocked_features_company ON unlocked_features(company_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_features_key ON unlocked_features(feature_key);

-- Function to update company milestone progress
CREATE OR REPLACE FUNCTION update_company_milestone_progress(p_company_id UUID)
RETURNS void AS $$
DECLARE
  v_total_tests INTEGER;
  v_recent_tests INTEGER;
  v_quality_tests INTEGER;
  v_new_phase TEXT;
BEGIN
  -- Count total completed tests
  SELECT COUNT(*) INTO v_total_tests
  FROM test_runs
  WHERE company_id = p_company_id
    AND status = 'completed';
  
  -- Count tests in last 30 days
  SELECT COUNT(*) INTO v_recent_tests
  FROM test_runs
  WHERE company_id = p_company_id
    AND status = 'completed'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Count high quality tests (4+ stars)
  SELECT COUNT(*) INTO v_quality_tests
  FROM test_runs
  WHERE company_id = p_company_id
    AND status = 'completed'
    AND company_ai_rating >= 4;
  
  -- Determine phase based on test count
  IF v_total_tests >= 10000 THEN
    v_new_phase := 'phase4';
  ELSIF v_total_tests >= 5000 THEN
    v_new_phase := 'phase3';
  ELSIF v_total_tests >= 1000 THEN
    v_new_phase := 'phase2';
  ELSE
    v_new_phase := 'phase1';
  END IF;
  
  -- Upsert milestone progress
  INSERT INTO milestone_progress (
    company_id,
    total_tests_completed,
    tests_last_30_days,
    high_quality_tests,
    current_phase,
    updated_at
  ) VALUES (
    p_company_id,
    v_total_tests,
    v_recent_tests,
    v_quality_tests,
    v_new_phase,
    NOW()
  )
  ON CONFLICT (company_id) DO UPDATE SET
    total_tests_completed = EXCLUDED.total_tests_completed,
    tests_last_30_days = EXCLUDED.tests_last_30_days,
    high_quality_tests = EXCLUDED.high_quality_tests,
    current_phase = EXCLUDED.current_phase,
    updated_at = NOW();
  
  -- Auto-unlock features based on milestones
  -- Phase 2 unlocks (1,000 tests)
  IF v_total_tests >= 1000 THEN
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'session_recording')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
    
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'advanced_analytics')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
  END IF;
  
  -- Phase 3 unlocks (5,000 tests)
  IF v_total_tests >= 5000 THEN
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'api_access')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
    
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'custom_personas')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
  END IF;
  
  -- Phase 4 unlocks (10,000 tests)
  IF v_total_tests >= 10000 THEN
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'white_label')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
    
    INSERT INTO unlocked_features (company_id, feature_key)
    VALUES (p_company_id, 'dedicated_support')
    ON CONFLICT (company_id, feature_key) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic milestone updates
CREATE OR REPLACE FUNCTION trigger_company_milestone_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_company_milestone_progress(NEW.company_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on test_runs for company milestone tracking
DROP TRIGGER IF EXISTS after_test_completion_milestone ON test_runs;
CREATE TRIGGER after_test_completion_milestone
  AFTER INSERT OR UPDATE ON test_runs
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trigger_company_milestone_update();

-- Enable RLS
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milestone_progress
CREATE POLICY "Companies can view own milestone progress"
  ON milestone_progress
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage milestone progress"
  ON milestone_progress
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for unlocked_features
CREATE POLICY "Companies can view own unlocked features"
  ON unlocked_features
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage unlocked features"
  ON unlocked_features
  FOR ALL
  USING (auth.role() = 'service_role');

-- Initialize milestone progress for existing companies
INSERT INTO milestone_progress (company_id, total_tests_completed, current_phase)
SELECT 
  id,
  0,
  'phase1'
FROM companies
ON CONFLICT (company_id) DO NOTHING;

-- Update progress for companies with existing tests
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN SELECT id FROM companies LOOP
    PERFORM update_company_milestone_progress(company_record.id);
  END LOOP;
END $$;
