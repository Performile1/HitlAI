-- Tester Profile, Ratings, and Test History Enhancements
-- Created: 2026-01-13
-- Purpose: Add comprehensive tester profiles, rating systems, test history tracking

-- ============================================================================
-- 1. ENHANCE HUMAN TESTERS TABLE
-- ============================================================================

-- Add missing profile fields
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('high_school', 'bachelors', 'masters', 'phd', 'other'));

-- Testing experience
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS years_of_testing_experience INT DEFAULT 0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS previous_platforms TEXT[];

-- Preferences
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS preferred_test_types TEXT[];
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS preferred_industries TEXT[];
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS min_test_duration_minutes INT DEFAULT 10;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS max_test_duration_minutes INT DEFAULT 60;

-- Availability
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS available_hours JSONB DEFAULT '{}'::jsonb;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS max_tests_per_week INT DEFAULT 10;

-- Payment
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'paypal', 'equity', 'hybrid'));
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- Verification
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'not_required' CHECK (background_check_status IN ('not_required', 'pending', 'passed', 'failed'));
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS nda_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS nda_signed_at TIMESTAMPTZ;

-- Enhanced ratings
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS avg_communication_rating FLOAT DEFAULT 0.0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS avg_quality_rating FLOAT DEFAULT 0.0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS avg_timeliness_rating FLOAT DEFAULT 0.0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS positive_feedback_count INT DEFAULT 0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS negative_feedback_count INT DEFAULT 0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS would_work_again_percent FLOAT DEFAULT 0.0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Tier system
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'new' CHECK (tier IN ('new', 'verified', 'expert', 'master'));
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS platform_fee_percent INT DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_human_testers_tier ON human_testers(tier);
CREATE INDEX IF NOT EXISTS idx_human_testers_email ON human_testers(email);

-- ============================================================================
-- 2. ENHANCE HUMAN TEST ASSIGNMENTS TABLE (Detailed Ratings)
-- ============================================================================

ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5);
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5);
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5);
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5);
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS would_work_again BOOLEAN;
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT FALSE;
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS amount_earned_usd DECIMAL(10,2);
ALTER TABLE human_test_assignments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed'));

CREATE INDEX IF NOT EXISTS idx_assignments_flagged ON human_test_assignments(flagged_for_review) WHERE flagged_for_review = TRUE;

-- ============================================================================
-- 3. TESTER TEST HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tester_test_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  test_assignment_id UUID REFERENCES human_test_assignments(id) ON DELETE SET NULL,
  test_request_id UUID REFERENCES test_requests(id) ON DELETE SET NULL,
  
  -- Test Details
  test_category TEXT NOT NULL, -- ecommerce, saas, mobile, accessibility, etc.
  test_type TEXT NOT NULL, -- usability, accessibility, functional, exploratory
  industry TEXT, -- fintech, healthcare, education, etc.
  
  -- Performance
  completion_time_minutes INT,
  issues_found INT DEFAULT 0,
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Ratings
  company_rating INT CHECK (company_rating >= 1 AND company_rating <= 5),
  company_feedback TEXT,
  
  -- Earnings
  amount_earned_usd DECIMAL(10,2),
  platform_fee_usd DECIMAL(10,2),
  payment_method TEXT,
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tester_history_tester ON tester_test_history(tester_id);
CREATE INDEX IF NOT EXISTS idx_tester_history_category ON tester_test_history(test_category);
CREATE INDEX IF NOT EXISTS idx_tester_history_industry ON tester_test_history(industry);
CREATE INDEX IF NOT EXISTS idx_tester_history_completed ON tester_test_history(completed_at DESC);

-- ============================================================================
-- 4. COMPANY-SPECIFIC TESTER RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_tester_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  
  -- Aggregate ratings from this company
  tests_completed INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0.0,
  last_worked_together TIMESTAMPTZ,
  
  -- Preferences
  is_preferred_tester BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  private_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, tester_id)
);

CREATE INDEX IF NOT EXISTS idx_company_tester_company ON company_tester_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tester_tester ON company_tester_ratings(tester_id);
CREATE INDEX IF NOT EXISTS idx_company_tester_preferred ON company_tester_ratings(company_id, is_preferred_tester) WHERE is_preferred_tester = TRUE;

-- ============================================================================
-- 5. AI PERSONA RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_persona_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE UNIQUE,
  
  -- Performance Metrics
  total_tests_run INT DEFAULT 0,
  accuracy_score FLOAT DEFAULT 0.90, -- default 90%
  
  -- Comparison to Humans
  agreement_with_humans_percent FLOAT,
  false_positive_rate FLOAT,
  false_negative_rate FLOAT,
  
  -- Quality Metrics
  avg_issues_found_per_test FLOAT,
  avg_test_duration_seconds INT,
  consistency_score FLOAT, -- how consistent are results
  
  -- User Feedback
  company_satisfaction_score FLOAT,
  total_company_ratings INT DEFAULT 0,
  
  -- Confidence
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  needs_more_training BOOLEAN DEFAULT FALSE,
  last_retrained_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_persona_ratings_accuracy ON ai_persona_ratings(accuracy_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_persona_ratings_needs_training ON ai_persona_ratings(needs_more_training) WHERE needs_more_training = TRUE;

-- ============================================================================
-- 6. ENHANCE TEST RUNS TABLE (AI Performance Tracking)
-- ============================================================================

ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS ai_confidence_score FLOAT;
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS human_validation_score FLOAT;
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS accuracy_rating FLOAT;
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS company_ai_rating INT CHECK (company_ai_rating >= 1 AND company_ai_rating <= 5);
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS company_ai_feedback TEXT;
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS ai_was_helpful BOOLEAN;

-- ============================================================================
-- 7. ENHANCE TEST REQUESTS TABLE (Overall Ratings)
-- ============================================================================

ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS overall_satisfaction_rating INT CHECK (overall_satisfaction_rating >= 1 AND overall_satisfaction_rating <= 5);
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS overall_feedback TEXT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS avg_tester_rating FLOAT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS num_testers_rated INT DEFAULT 0;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS avg_ai_rating FLOAT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS ai_accuracy_score FLOAT;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS would_use_hitlai_again BOOLEAN;
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS nps_score INT CHECK (nps_score >= -100 AND nps_score <= 100);
ALTER TABLE test_requests ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

-- ============================================================================
-- 8. ANALYTICS VIEWS
-- ============================================================================

-- Tester expertise by category
CREATE OR REPLACE VIEW tester_category_expertise AS
SELECT 
  tester_id,
  test_category,
  COUNT(*) as tests_completed,
  AVG(quality_score) as avg_quality,
  AVG(company_rating) as avg_rating,
  SUM(issues_found) as total_issues_found,
  AVG(amount_earned_usd) as avg_earnings_per_test
FROM tester_test_history
WHERE completed_at IS NOT NULL
GROUP BY tester_id, test_category;

-- Tester recent performance (last 30 days)
CREATE OR REPLACE VIEW tester_recent_performance AS
SELECT 
  tester_id,
  COUNT(*) as tests_last_30_days,
  AVG(quality_score) as avg_quality_30d,
  AVG(company_rating) as avg_rating_30d,
  SUM(amount_earned_usd) as earnings_last_30_days
FROM tester_test_history
WHERE completed_at > NOW() - INTERVAL '30 days'
GROUP BY tester_id;

-- Top rated testers
CREATE OR REPLACE VIEW top_rated_testers AS
SELECT 
  ht.id,
  ht.display_name,
  ht.average_rating,
  ht.total_tests_completed,
  ht.total_ratings,
  ht.tier,
  ht.badges,
  ht.specialties
FROM human_testers ht
WHERE ht.total_ratings >= 5
  AND ht.is_verified = TRUE
ORDER BY ht.average_rating DESC, ht.total_tests_completed DESC
LIMIT 100;

-- AI persona performance comparison
CREATE OR REPLACE VIEW ai_persona_performance AS
SELECT 
  p.id,
  p.name,
  p.age,
  p.tech_literacy,
  apr.accuracy_score,
  apr.total_tests_run,
  apr.company_satisfaction_score,
  apr.confidence_level,
  apr.needs_more_training
FROM personas p
LEFT JOIN ai_persona_ratings apr ON p.id = apr.persona_id
ORDER BY apr.accuracy_score DESC NULLS LAST;

-- ============================================================================
-- 9. FUNCTIONS FOR RATING CALCULATIONS
-- ============================================================================

-- Function to update tester aggregate ratings
CREATE OR REPLACE FUNCTION update_tester_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if rating was added or changed
  IF (TG_OP = 'INSERT' AND NEW.overall_rating IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.overall_rating IS DISTINCT FROM OLD.overall_rating AND NEW.overall_rating IS NOT NULL) THEN
    
    UPDATE human_testers
    SET 
      total_ratings = (
        SELECT COUNT(*) 
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND overall_rating IS NOT NULL
      ),
      average_rating = (
        SELECT AVG(overall_rating)::FLOAT 
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND overall_rating IS NOT NULL
      ),
      avg_communication_rating = (
        SELECT AVG(communication_rating)::FLOAT 
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND communication_rating IS NOT NULL
      ),
      avg_quality_rating = (
        SELECT AVG(quality_rating)::FLOAT 
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND quality_rating IS NOT NULL
      ),
      avg_timeliness_rating = (
        SELECT AVG(timeliness_rating)::FLOAT 
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND timeliness_rating IS NOT NULL
      ),
      would_work_again_percent = (
        SELECT (COUNT(*) FILTER (WHERE would_work_again = TRUE)::FLOAT / NULLIF(COUNT(*), 0) * 100)
        FROM human_test_assignments 
        WHERE tester_id = NEW.tester_id AND would_work_again IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = NEW.tester_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tester ratings
DROP TRIGGER IF EXISTS trigger_update_tester_ratings ON human_test_assignments;
CREATE TRIGGER trigger_update_tester_ratings
  AFTER INSERT OR UPDATE OF overall_rating, communication_rating, quality_rating, timeliness_rating, would_work_again
  ON human_test_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_tester_ratings();

-- Function to update tester tier based on performance
CREATE OR REPLACE FUNCTION update_tester_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier based on tests completed and rating
  IF NEW.total_tests_completed >= 500 AND NEW.average_rating >= 4.5 THEN
    NEW.tier = 'master';
    NEW.platform_fee_percent = 15;
  ELSIF NEW.total_tests_completed >= 200 AND NEW.average_rating >= 4.0 THEN
    NEW.tier = 'expert';
    NEW.platform_fee_percent = 20;
  ELSIF NEW.total_tests_completed >= 50 AND NEW.average_rating >= 3.5 THEN
    NEW.tier = 'verified';
    NEW.platform_fee_percent = 25;
  ELSE
    NEW.tier = 'new';
    NEW.platform_fee_percent = 30;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tester tier
DROP TRIGGER IF EXISTS trigger_update_tester_tier ON human_testers;
CREATE TRIGGER trigger_update_tester_tier
  BEFORE UPDATE OF total_tests_completed, average_rating
  ON human_testers
  FOR EACH ROW
  EXECUTE FUNCTION update_tester_tier();

-- ============================================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tester_test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tester_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_persona_ratings ENABLE ROW LEVEL SECURITY;

-- Testers can view their own test history
DROP POLICY IF EXISTS "Testers can view own test history" ON tester_test_history;
CREATE POLICY "Testers can view own test history"
  ON tester_test_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM human_testers
      WHERE human_testers.id = tester_test_history.tester_id
      AND human_testers.user_id = auth.uid()
    )
  );

-- Companies can view ratings for their testers
DROP POLICY IF EXISTS "Companies can view their tester ratings" ON company_tester_ratings;
CREATE POLICY "Companies can view their tester ratings"
  ON company_tester_ratings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = company_tester_ratings.company_id
      AND company_members.user_id = auth.uid()
    )
  );

-- AI persona ratings are public (read-only for non-admins)
DROP POLICY IF EXISTS "Anyone can view AI persona ratings" ON ai_persona_ratings;
CREATE POLICY "Anyone can view AI persona ratings"
  ON ai_persona_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify AI persona ratings" ON ai_persona_ratings;
CREATE POLICY "Only admins can modify AI persona ratings"
  ON ai_persona_ratings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 11. INITIALIZE AI PERSONA RATINGS (90% default)
-- ============================================================================

-- Insert default ratings for existing personas
INSERT INTO ai_persona_ratings (persona_id, accuracy_score, confidence_level)
SELECT id, 0.90, 'medium'
FROM personas
ON CONFLICT (persona_id) DO NOTHING;

-- ============================================================================
-- 12. COMMENTS
-- ============================================================================

COMMENT ON TABLE tester_test_history IS 'Tracks detailed history of all tests completed by human testers';
COMMENT ON TABLE company_tester_ratings IS 'Company-specific ratings and preferences for testers';
COMMENT ON TABLE ai_persona_ratings IS 'Performance metrics and ratings for AI personas';
COMMENT ON COLUMN human_testers.tier IS 'Tester tier: new (30% fee), verified (25% fee), expert (20% fee), master (15% fee)';
COMMENT ON COLUMN human_testers.platform_fee_percent IS 'Platform commission percentage based on tier';
COMMENT ON COLUMN ai_persona_ratings.accuracy_score IS 'Default 90% for new personas, updated based on validation';
