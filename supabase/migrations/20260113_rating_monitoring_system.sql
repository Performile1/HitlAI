-- Rating Monitoring System for Human and AI Testers
-- Allows admin to set thresholds for flagging and auto-disabling low-rated testers

-- ============================================================================
-- 1. ADD RATING THRESHOLD SETTINGS TO PLATFORM_SETTINGS
-- ============================================================================

ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS human_tester_flag_threshold DECIMAL(3,2) DEFAULT 3.5;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS human_tester_disable_threshold DECIMAL(3,2) DEFAULT 2.5;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS ai_tester_flag_threshold DECIMAL(3,2) DEFAULT 0.75;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS ai_tester_disable_threshold DECIMAL(3,2) DEFAULT 0.60;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_ratings_before_action INT DEFAULT 5;

COMMENT ON COLUMN platform_settings.human_tester_flag_threshold IS 'Human tester rating below this (out of 5.0) gets flagged for review';
COMMENT ON COLUMN platform_settings.human_tester_disable_threshold IS 'Human tester rating below this (out of 5.0) gets auto-disabled';
COMMENT ON COLUMN platform_settings.ai_tester_flag_threshold IS 'AI tester accuracy below this (0.0-1.0) gets flagged for retraining';
COMMENT ON COLUMN platform_settings.ai_tester_disable_threshold IS 'AI tester accuracy below this (0.0-1.0) gets auto-disabled';
COMMENT ON COLUMN platform_settings.min_ratings_before_action IS 'Minimum number of ratings before flagging/disabling actions are taken';


-- ============================================================================
-- 2. ADD FLAGGING FIELDS TO HUMAN_TESTERS
-- ============================================================================

ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS auto_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS disabled_reason TEXT;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS last_rating_check TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_human_testers_flagged ON human_testers(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_human_testers_auto_disabled ON human_testers(auto_disabled) WHERE auto_disabled = TRUE;


-- ============================================================================
-- 3. ADD FLAGGING FIELDS TO AI_PERSONA_RATINGS (for AI testers)
-- ============================================================================

ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS auto_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;
ALTER TABLE ai_persona_ratings ADD COLUMN IF NOT EXISTS disabled_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_ai_persona_ratings_flagged ON ai_persona_ratings(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_persona_ratings_auto_disabled ON ai_persona_ratings(auto_disabled) WHERE auto_disabled = TRUE;


-- ============================================================================
-- 4. FUNCTION TO CHECK AND FLAG/DISABLE HUMAN TESTERS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_human_tester_rating()
RETURNS TRIGGER AS $$
DECLARE
  settings RECORD;
  current_rating DECIMAL(3,2);
  total_ratings INT;
BEGIN
  -- Get platform settings
  SELECT * INTO settings FROM platform_settings LIMIT 1;
  
  -- Get current tester stats
  SELECT 
    average_rating,
    total_ratings
  INTO current_rating, total_ratings
  FROM human_testers
  WHERE id = NEW.id;
  
  -- Only take action if tester has minimum required ratings
  IF total_ratings >= settings.min_ratings_before_action THEN
    
    -- Check if rating dropped below disable threshold
    IF current_rating <= settings.human_tester_disable_threshold THEN
      UPDATE human_testers
      SET 
        auto_disabled = TRUE,
        disabled_at = NOW(),
        disabled_reason = 'Rating dropped to ' || current_rating || ' (threshold: ' || settings.human_tester_disable_threshold || ')',
        is_available = FALSE,
        is_flagged = TRUE,
        flagged_at = NOW(),
        flag_reason = 'Auto-disabled due to low rating',
        last_rating_check = NOW()
      WHERE id = NEW.id;
      
      -- Log the action
      INSERT INTO admin_action_log (
        action_type,
        target_type,
        target_id,
        reason,
        performed_by,
        created_at
      ) VALUES (
        'auto_disable_tester',
        'human_tester',
        NEW.id,
        'Rating ' || current_rating || ' below threshold ' || settings.human_tester_disable_threshold,
        NULL, -- System action
        NOW()
      );
    
    -- Check if rating dropped below flag threshold (but above disable)
    ELSIF current_rating <= settings.human_tester_flag_threshold THEN
      UPDATE human_testers
      SET 
        is_flagged = TRUE,
        flagged_at = NOW(),
        flag_reason = 'Rating dropped to ' || current_rating || ' (threshold: ' || settings.human_tester_flag_threshold || ')',
        last_rating_check = NOW()
      WHERE id = NEW.id
      AND is_flagged = FALSE; -- Only flag if not already flagged
      
      -- Log the action
      INSERT INTO admin_action_log (
        action_type,
        target_type,
        target_id,
        reason,
        performed_by,
        created_at
      ) VALUES (
        'flag_tester',
        'human_tester',
        NEW.id,
        'Rating ' || current_rating || ' below threshold ' || settings.human_tester_flag_threshold,
        NULL, -- System action
        NOW()
      );
    
    -- Rating is good - unflag if previously flagged
    ELSE
      UPDATE human_testers
      SET 
        is_flagged = FALSE,
        flagged_at = NULL,
        flag_reason = NULL,
        last_rating_check = NOW()
      WHERE id = NEW.id
      AND is_flagged = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check rating after updates
DROP TRIGGER IF EXISTS trigger_check_human_tester_rating ON human_testers;
CREATE TRIGGER trigger_check_human_tester_rating
  AFTER UPDATE OF average_rating ON human_testers
  FOR EACH ROW
  EXECUTE FUNCTION check_human_tester_rating();


-- ============================================================================
-- 5. FUNCTION TO CHECK AND FLAG/DISABLE AI TESTERS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_ai_tester_rating()
RETURNS TRIGGER AS $$
DECLARE
  settings RECORD;
  current_accuracy DECIMAL(5,4);
  total_tests INT;
BEGIN
  -- Get platform settings
  SELECT * INTO settings FROM platform_settings LIMIT 1;
  
  -- Get current AI tester stats
  SELECT 
    accuracy_score,
    total_tests_run
  INTO current_accuracy, total_tests
  FROM ai_persona_ratings
  WHERE id = NEW.id;
  
  -- Only take action if AI has run minimum required tests
  IF total_tests >= settings.min_ratings_before_action THEN
    
    -- Check if accuracy dropped below disable threshold
    IF current_accuracy <= settings.ai_tester_disable_threshold THEN
      UPDATE ai_persona_ratings
      SET 
        auto_disabled = TRUE,
        disabled_at = NOW(),
        disabled_reason = 'Accuracy dropped to ' || (current_accuracy * 100) || '% (threshold: ' || (settings.ai_tester_disable_threshold * 100) || '%)',
        is_flagged = TRUE,
        flagged_at = NOW(),
        flag_reason = 'Auto-disabled due to low accuracy',
        needs_more_training = TRUE
      WHERE id = NEW.id;
      
      -- Also disable the persona itself
      UPDATE personas
      SET is_default = FALSE
      WHERE id = NEW.persona_id;
      
      -- Log the action
      INSERT INTO admin_action_log (
        action_type,
        target_type,
        target_id,
        reason,
        performed_by,
        created_at
      ) VALUES (
        'auto_disable_ai_tester',
        'ai_persona',
        NEW.persona_id,
        'Accuracy ' || (current_accuracy * 100) || '% below threshold ' || (settings.ai_tester_disable_threshold * 100) || '%',
        NULL, -- System action
        NOW()
      );
    
    -- Check if accuracy dropped below flag threshold (but above disable)
    ELSIF current_accuracy <= settings.ai_tester_flag_threshold THEN
      UPDATE ai_persona_ratings
      SET 
        is_flagged = TRUE,
        flagged_at = NOW(),
        flag_reason = 'Accuracy dropped to ' || (current_accuracy * 100) || '% (threshold: ' || (settings.ai_tester_flag_threshold * 100) || '%)',
        needs_more_training = TRUE
      WHERE id = NEW.id
      AND is_flagged = FALSE;
      
      -- Log the action
      INSERT INTO admin_action_log (
        action_type,
        target_type,
        target_id,
        reason,
        performed_by,
        created_at
      ) VALUES (
        'flag_ai_tester',
        'ai_persona',
        NEW.persona_id,
        'Accuracy ' || (current_accuracy * 100) || '% below threshold ' || (settings.ai_tester_flag_threshold * 100) || '%',
        NULL, -- System action
        NOW()
      );
    
    -- Accuracy is good - unflag if previously flagged
    ELSE
      UPDATE ai_persona_ratings
      SET 
        is_flagged = FALSE,
        flagged_at = NULL,
        flag_reason = NULL
      WHERE id = NEW.id
      AND is_flagged = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check AI rating after updates
DROP TRIGGER IF EXISTS trigger_check_ai_tester_rating ON ai_persona_ratings;
CREATE TRIGGER trigger_check_ai_tester_rating
  AFTER UPDATE OF accuracy_score ON ai_persona_ratings
  FOR EACH ROW
  EXECUTE FUNCTION check_ai_tester_rating();


-- ============================================================================
-- 6. ADMIN ACTION LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL, -- flag_tester, auto_disable_tester, flag_ai_tester, auto_disable_ai_tester, manual_enable, manual_disable
  target_type TEXT NOT NULL, -- human_tester, ai_persona
  target_id UUID NOT NULL,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id), -- NULL for system actions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_log_target ON admin_action_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_created ON admin_action_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_type ON admin_action_log(action_type);


-- ============================================================================
-- 7. VIEWS FOR ADMIN MONITORING
-- ============================================================================

-- View of all flagged human testers
CREATE OR REPLACE VIEW flagged_human_testers AS
SELECT 
  ht.id,
  ht.display_name,
  ht.email,
  ht.average_rating,
  ht.total_ratings,
  ht.total_tests_completed,
  ht.tier,
  ht.is_flagged,
  ht.flagged_at,
  ht.flag_reason,
  ht.auto_disabled,
  ht.disabled_at,
  ht.disabled_reason,
  ht.is_available,
  ps.human_tester_flag_threshold,
  ps.human_tester_disable_threshold
FROM human_testers ht
CROSS JOIN platform_settings ps
WHERE ht.is_flagged = TRUE OR ht.auto_disabled = TRUE
ORDER BY ht.flagged_at DESC NULLS LAST;

-- View of all flagged AI testers
CREATE OR REPLACE VIEW flagged_ai_testers AS
SELECT 
  p.id as persona_id,
  p.name as persona_name,
  apr.id as rating_id,
  apr.accuracy_score,
  apr.total_tests_run,
  apr.company_satisfaction_score,
  apr.is_flagged,
  apr.flagged_at,
  apr.flag_reason,
  apr.auto_disabled,
  apr.disabled_at,
  apr.disabled_reason,
  apr.needs_more_training,
  ps.ai_tester_flag_threshold,
  ps.ai_tester_disable_threshold
FROM personas p
JOIN ai_persona_ratings apr ON p.id = apr.persona_id
CROSS JOIN platform_settings ps
WHERE apr.is_flagged = TRUE OR apr.auto_disabled = TRUE
ORDER BY apr.flagged_at DESC NULLS LAST;

-- Combined view of all flagged testers
CREATE OR REPLACE VIEW all_flagged_testers AS
SELECT 
  'human' as tester_type,
  id::TEXT as tester_id,
  display_name as tester_name,
  average_rating::TEXT as rating,
  total_ratings as total_evaluations,
  is_flagged,
  flagged_at,
  flag_reason,
  auto_disabled,
  disabled_at,
  disabled_reason
FROM flagged_human_testers
UNION ALL
SELECT 
  'ai' as tester_type,
  persona_id::TEXT as tester_id,
  persona_name as tester_name,
  (accuracy_score * 100)::TEXT || '%' as rating,
  total_tests_run as total_evaluations,
  is_flagged,
  flagged_at,
  flag_reason,
  auto_disabled,
  disabled_at,
  disabled_reason
FROM flagged_ai_testers
ORDER BY flagged_at DESC NULLS LAST;


-- ============================================================================
-- 8. UPDATE DEFAULT PLATFORM SETTINGS
-- ============================================================================

UPDATE platform_settings
SET 
  human_tester_flag_threshold = 3.5,
  human_tester_disable_threshold = 2.5,
  ai_tester_flag_threshold = 0.75,
  ai_tester_disable_threshold = 0.60,
  min_ratings_before_action = 5
WHERE human_tester_flag_threshold IS NULL;


-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- RATING MONITORING SYSTEM:
-- 
-- HUMAN TESTERS:
--   - Flag threshold: 3.5/5.0 (configurable in admin settings)
--   - Auto-disable threshold: 2.5/5.0 (configurable in admin settings)
--   - Requires minimum 5 ratings before actions are taken
--   - Flagged testers appear in admin dashboard for review
--   - Auto-disabled testers are marked unavailable and logged
--
-- AI TESTERS (PERSONAS):
--   - Flag threshold: 75% accuracy (configurable in admin settings)
--   - Auto-disable threshold: 60% accuracy (configurable in admin settings)
--   - Requires minimum 5 tests before actions are taken
--   - Flagged AI testers are marked for retraining
--   - Auto-disabled AI testers are removed from default personas
--
-- ADMIN CONTROLS:
--   - View all flagged testers: SELECT * FROM all_flagged_testers;
--   - View flagged humans: SELECT * FROM flagged_human_testers;
--   - View flagged AI: SELECT * FROM flagged_ai_testers;
--   - View action log: SELECT * FROM admin_action_log;
--   - Configure thresholds in /admin/settings
--
-- AUTOMATIC ACTIONS:
--   - Ratings checked after every update
--   - Flagging happens automatically when threshold crossed
--   - Auto-disable happens automatically when critical threshold crossed
--   - All actions logged in admin_action_log table
--   - Admins notified via flagged tester views
--
-- ============================================================================
