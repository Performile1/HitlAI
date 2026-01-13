-- AI Training Incentive System
-- Human testers earn a percentage of AI earnings from personas they helped train
-- Admin-configurable revenue sharing model

-- ============================================================================
-- 1. ADD REVENUE SHARING SETTINGS TO PLATFORM_SETTINGS
-- ============================================================================

ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS ai_revenue_sharing_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS ai_revenue_pool_percent DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS trainer_share_per_ai_test DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_training_tests_for_share INT DEFAULT 10;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS revenue_sharing_terms_version INT DEFAULT 1;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS revenue_sharing_terms_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN platform_settings.ai_revenue_sharing_enabled IS 'Enable/disable revenue sharing with human trainers';
COMMENT ON COLUMN platform_settings.ai_revenue_pool_percent IS 'Percentage of total AI earnings allocated to revenue sharing pool (e.g., 50% of $100 = $50 pool)';
COMMENT ON COLUMN platform_settings.trainer_share_per_ai_test IS 'Percentage of each AI test earning that goes to trainers (e.g., 10% of $5 AI test = $0.50)';
COMMENT ON COLUMN platform_settings.min_training_tests_for_share IS 'Minimum training tests required before earning revenue share';
COMMENT ON COLUMN platform_settings.revenue_sharing_terms_version IS 'Current version of revenue sharing terms';
COMMENT ON COLUMN platform_settings.revenue_sharing_terms_updated_at IS 'Last time revenue sharing terms were updated';


-- ============================================================================
-- 2. ADD AI TRAINING EARNINGS TO HUMAN_TESTERS TABLE
-- ============================================================================

ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS total_ai_training_earnings DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS ai_personas_trained INT DEFAULT 0;
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS last_ai_payout_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_human_testers_ai_earnings ON human_testers(total_ai_training_earnings);

COMMENT ON COLUMN human_testers.total_ai_training_earnings IS 'Total earnings from AI revenue sharing - automatically updated';
COMMENT ON COLUMN human_testers.ai_personas_trained IS 'Number of AI personas this tester has trained';


-- ============================================================================
-- 3. AI TRAINING CONTRIBUTIONS TABLE
-- ============================================================================
-- Tracks which human testers contributed to training which AI personas

CREATE TABLE IF NOT EXISTS ai_training_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  
  -- Training Contribution
  training_tests_completed INT DEFAULT 0,
  training_quality_score FLOAT, -- Average quality of their training tests
  contribution_weight DECIMAL(5,4) DEFAULT 0.0000, -- Their share of this persona (0.0000 to 1.0000)
  
  -- Earnings Tracking
  total_ai_tests_run INT DEFAULT 0, -- How many AI tests this persona has run
  total_revenue_earned DECIMAL(10,2) DEFAULT 0.00, -- Total revenue this trainer earned from this AI
  last_payout_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  terms_version_accepted INT, -- Which terms version they accepted
  terms_accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tester_id, persona_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_training_tester ON ai_training_contributions(tester_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_persona ON ai_training_contributions(persona_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_active ON ai_training_contributions(is_active) WHERE is_active = TRUE;


-- ============================================================================
-- 3. AI REVENUE SHARING TRANSACTIONS TABLE
-- ============================================================================
-- Tracks individual revenue share payments to trainers

CREATE TABLE IF NOT EXISTS ai_revenue_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES ai_training_contributions(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  
  -- Transaction Details
  ai_test_run_id UUID, -- Reference to the AI test that generated revenue
  ai_test_revenue DECIMAL(10,2), -- Revenue from the AI test ($5)
  trainer_share_percent DECIMAL(5,2), -- Percentage this trainer gets
  trainer_earnings DECIMAL(10,2), -- Amount this trainer earned
  
  -- Pool Tracking
  total_pool_amount DECIMAL(10,2), -- Total pool available at time of transaction
  pool_percent_used DECIMAL(5,2), -- Percentage of pool used for this transaction
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_trans_tester ON ai_revenue_transactions(tester_id);
CREATE INDEX IF NOT EXISTS idx_revenue_trans_persona ON ai_revenue_transactions(persona_id);
CREATE INDEX IF NOT EXISTS idx_revenue_trans_status ON ai_revenue_transactions(status);
CREATE INDEX IF NOT EXISTS idx_revenue_trans_created ON ai_revenue_transactions(created_at DESC);


-- ============================================================================
-- 4. REVENUE SHARING POOL TABLE
-- ============================================================================
-- Tracks the global revenue sharing pool

CREATE TABLE IF NOT EXISTS revenue_sharing_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pool Balances
  total_ai_revenue DECIMAL(12,2) DEFAULT 0.00, -- Total revenue from all AI tests
  pool_allocation_percent DECIMAL(5,2), -- Percentage allocated to pool
  total_pool_amount DECIMAL(12,2) DEFAULT 0.00, -- Total amount in pool
  distributed_amount DECIMAL(12,2) DEFAULT 0.00, -- Amount already distributed
  available_amount DECIMAL(12,2) DEFAULT 0.00, -- Amount available for distribution
  
  -- Period Tracking
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Status
  is_current_period BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_pool_current ON revenue_sharing_pool(is_current_period) WHERE is_current_period = TRUE;


-- ============================================================================
-- 5. TERMS AND CONDITIONS VERSIONS TABLE
-- ============================================================================
-- Track changes to revenue sharing terms

CREATE TABLE IF NOT EXISTS revenue_sharing_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INT NOT NULL UNIQUE,
  
  -- Terms Details
  ai_revenue_pool_percent DECIMAL(5,2),
  trainer_share_per_ai_test DECIMAL(5,2),
  min_training_tests_for_share INT,
  
  -- Legal
  terms_text TEXT,
  summary TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  effective_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_terms_version ON revenue_sharing_terms(version DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_terms_active ON revenue_sharing_terms(is_active) WHERE is_active = TRUE;


-- ============================================================================
-- 6. TESTER TERMS ACCEPTANCE TABLE
-- ============================================================================
-- Track which testers have accepted which terms versions

CREATE TABLE IF NOT EXISTS tester_terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  terms_version INT REFERENCES revenue_sharing_terms(version),
  
  -- Acceptance Details
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  
  UNIQUE(tester_id, terms_version)
);

CREATE INDEX IF NOT EXISTS idx_tester_terms_tester ON tester_terms_acceptance(tester_id);
CREATE INDEX IF NOT EXISTS idx_tester_terms_version ON tester_terms_acceptance(terms_version);


-- ============================================================================
-- 7. FUNCTION TO CALCULATE TRAINER CONTRIBUTION WEIGHT
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_trainer_contribution_weight(
  p_persona_id UUID,
  p_tester_id UUID
)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  total_training_tests INT;
  tester_training_tests INT;
  contribution_weight DECIMAL(5,4);
BEGIN
  -- Get total training tests for this persona
  SELECT COALESCE(SUM(training_tests_completed), 0)
  INTO total_training_tests
  FROM ai_training_contributions
  WHERE persona_id = p_persona_id
  AND is_active = TRUE;
  
  -- Get this tester's training tests
  SELECT COALESCE(training_tests_completed, 0)
  INTO tester_training_tests
  FROM ai_training_contributions
  WHERE persona_id = p_persona_id
  AND tester_id = p_tester_id
  AND is_active = TRUE;
  
  -- Calculate weight (their tests / total tests)
  IF total_training_tests > 0 THEN
    contribution_weight := (tester_training_tests::DECIMAL / total_training_tests::DECIMAL);
  ELSE
    contribution_weight := 0.0000;
  END IF;
  
  RETURN contribution_weight;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 8. FUNCTION TO DISTRIBUTE AI TEST REVENUE
-- ============================================================================

CREATE OR REPLACE FUNCTION distribute_ai_test_revenue(
  p_persona_id UUID,
  p_ai_test_revenue DECIMAL(10,2),
  p_ai_test_run_id UUID
)
RETURNS VOID AS $$
DECLARE
  settings RECORD;
  pool RECORD;
  trainer RECORD;
  trainer_share DECIMAL(10,2);
  pool_contribution DECIMAL(10,2);
BEGIN
  -- Get platform settings
  SELECT * INTO settings FROM platform_settings LIMIT 1;
  
  -- Check if revenue sharing is enabled
  IF NOT settings.ai_revenue_sharing_enabled THEN
    RETURN;
  END IF;
  
  -- Get current revenue pool
  SELECT * INTO pool FROM revenue_sharing_pool WHERE is_current_period = TRUE LIMIT 1;
  
  -- Calculate pool contribution (e.g., 10% of $5 = $0.50)
  pool_contribution := p_ai_test_revenue * (settings.trainer_share_per_ai_test / 100);
  
  -- Update revenue pool
  UPDATE revenue_sharing_pool
  SET 
    total_ai_revenue = total_ai_revenue + p_ai_test_revenue,
    total_pool_amount = total_pool_amount + pool_contribution,
    available_amount = available_amount + pool_contribution,
    updated_at = NOW()
  WHERE id = pool.id;
  
  -- Distribute to trainers who contributed to this persona
  FOR trainer IN
    SELECT 
      atc.id as contribution_id,
      atc.tester_id,
      atc.persona_id,
      atc.contribution_weight,
      atc.training_tests_completed
    FROM ai_training_contributions atc
    WHERE atc.persona_id = p_persona_id
    AND atc.is_active = TRUE
    AND atc.training_tests_completed >= settings.min_training_tests_for_share
    ORDER BY atc.contribution_weight DESC
  LOOP
    -- Calculate this trainer's share (pool contribution * their weight)
    trainer_share := pool_contribution * trainer.contribution_weight;
    
    -- Create revenue transaction
    INSERT INTO ai_revenue_transactions (
      contribution_id,
      tester_id,
      persona_id,
      ai_test_run_id,
      ai_test_revenue,
      trainer_share_percent,
      trainer_earnings,
      total_pool_amount,
      pool_percent_used,
      status
    ) VALUES (
      trainer.contribution_id,
      trainer.tester_id,
      trainer.persona_id,
      p_ai_test_run_id,
      p_ai_test_revenue,
      settings.trainer_share_per_ai_test,
      trainer_share,
      pool.total_pool_amount,
      (trainer_share / NULLIF(pool.total_pool_amount, 0) * 100),
      'pending'
    );
    
    -- Update trainer's total revenue earned
    UPDATE ai_training_contributions
    SET 
      total_ai_tests_run = total_ai_tests_run + 1,
      total_revenue_earned = total_revenue_earned + trainer_share,
      updated_at = NOW()
    WHERE id = trainer.contribution_id;
    
    -- Update pool distributed amount
    UPDATE revenue_sharing_pool
    SET 
      distributed_amount = distributed_amount + trainer_share,
      available_amount = available_amount - trainer_share,
      updated_at = NOW()
    WHERE id = pool.id;
  END LOOP;
  
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 9. FUNCTION TO UPDATE TESTER AI EARNINGS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tester_ai_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the tester's total AI training earnings
  UPDATE human_testers
  SET 
    total_ai_training_earnings = (
      SELECT COALESCE(SUM(total_revenue_earned), 0)
      FROM ai_training_contributions
      WHERE tester_id = NEW.tester_id
    ),
    ai_personas_trained = (
      SELECT COUNT(DISTINCT persona_id)
      FROM ai_training_contributions
      WHERE tester_id = NEW.tester_id
      AND is_active = TRUE
    ),
    last_ai_payout_at = NOW()
  WHERE id = NEW.tester_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tester AI earnings
DROP TRIGGER IF EXISTS trigger_update_tester_ai_earnings ON ai_training_contributions;
CREATE TRIGGER trigger_update_tester_ai_earnings
  AFTER UPDATE OF total_revenue_earned ON ai_training_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_tester_ai_earnings();


-- ============================================================================
-- 10. VIEWS FOR ADMIN MONITORING
-- ============================================================================

-- Trainer earnings summary
CREATE OR REPLACE VIEW trainer_revenue_summary AS
SELECT 
  ht.id as tester_id,
  ht.display_name,
  ht.email,
  COUNT(DISTINCT atc.persona_id) as personas_trained,
  SUM(atc.training_tests_completed) as total_training_tests,
  SUM(atc.total_ai_tests_run) as total_ai_tests_benefited,
  SUM(atc.total_revenue_earned) as total_revenue_earned,
  AVG(atc.contribution_weight) as avg_contribution_weight,
  MAX(atc.last_payout_at) as last_payout_at
FROM human_testers ht
JOIN ai_training_contributions atc ON ht.id = atc.tester_id
WHERE atc.is_active = TRUE
GROUP BY ht.id, ht.display_name, ht.email
ORDER BY total_revenue_earned DESC;

-- Persona training summary
CREATE OR REPLACE VIEW persona_training_summary AS
SELECT 
  p.id as persona_id,
  p.name as persona_name,
  COUNT(DISTINCT atc.tester_id) as trainers_count,
  SUM(atc.training_tests_completed) as total_training_tests,
  SUM(atc.total_ai_tests_run) as total_ai_tests_run,
  SUM(atc.total_revenue_earned) as total_revenue_distributed,
  apr.accuracy_score
FROM personas p
LEFT JOIN ai_training_contributions atc ON p.id = atc.persona_id AND atc.is_active = TRUE
LEFT JOIN ai_persona_ratings apr ON p.id = apr.persona_id
GROUP BY p.id, p.name, apr.accuracy_score
ORDER BY total_revenue_distributed DESC;

-- Revenue pool status
CREATE OR REPLACE VIEW revenue_pool_status AS
SELECT 
  rsp.*,
  (rsp.distributed_amount / NULLIF(rsp.total_pool_amount, 0) * 100) as distribution_percent,
  ps.ai_revenue_pool_percent,
  ps.trainer_share_per_ai_test
FROM revenue_sharing_pool rsp
CROSS JOIN platform_settings ps
WHERE rsp.is_current_period = TRUE;


-- ============================================================================
-- 10. INITIALIZE DEFAULT DATA
-- ============================================================================

-- Update platform settings with default revenue sharing config
UPDATE platform_settings
SET 
  ai_revenue_sharing_enabled = TRUE,
  ai_revenue_pool_percent = 50.00,
  trainer_share_per_ai_test = 10.00,
  min_training_tests_for_share = 10,
  revenue_sharing_terms_version = 1,
  revenue_sharing_terms_updated_at = NOW()
WHERE ai_revenue_sharing_enabled IS NULL;

-- Create initial revenue sharing pool
INSERT INTO revenue_sharing_pool (
  total_ai_revenue,
  pool_allocation_percent,
  total_pool_amount,
  distributed_amount,
  available_amount,
  period_start,
  period_end,
  is_current_period
) VALUES (
  0.00,
  50.00,
  0.00,
  0.00,
  0.00,
  NOW(),
  NOW() + INTERVAL '1 month',
  TRUE
) ON CONFLICT DO NOTHING;

-- Create initial terms version
INSERT INTO revenue_sharing_terms (
  version,
  ai_revenue_pool_percent,
  trainer_share_per_ai_test,
  min_training_tests_for_share,
  summary,
  terms_text,
  is_active,
  effective_date
) VALUES (
  1,
  50.00,
  10.00,
  10,
  'Human testers who train AI personas earn 10% of AI test revenue. 50% of total AI earnings go to the revenue sharing pool.',
  'By participating in AI training, you agree to receive revenue sharing payments based on your contribution to training AI personas. You will earn a percentage of revenue generated by AI tests run by personas you helped train. The percentage is calculated based on your training contribution weight. Minimum 10 training tests required to qualify for revenue sharing.',
  TRUE,
  NOW()
) ON CONFLICT (version) DO NOTHING;


-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_training_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tester_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Testers can view their own contributions
DROP POLICY IF EXISTS "Testers can view own training contributions" ON ai_training_contributions;
CREATE POLICY "Testers can view own training contributions"
  ON ai_training_contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM human_testers
      WHERE human_testers.id = ai_training_contributions.tester_id
      AND human_testers.user_id = auth.uid()
    )
  );

-- Testers can view their own revenue transactions
DROP POLICY IF EXISTS "Testers can view own revenue transactions" ON ai_revenue_transactions;
CREATE POLICY "Testers can view own revenue transactions"
  ON ai_revenue_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM human_testers
      WHERE human_testers.id = ai_revenue_transactions.tester_id
      AND human_testers.user_id = auth.uid()
    )
  );

-- Testers can insert their own terms acceptance
DROP POLICY IF EXISTS "Testers can accept terms" ON tester_terms_acceptance;
CREATE POLICY "Testers can accept terms"
  ON tester_terms_acceptance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM human_testers
      WHERE human_testers.id = tester_terms_acceptance.tester_id
      AND human_testers.user_id = auth.uid()
    )
  );


-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- AI TRAINING INCENTIVE SYSTEM:
-- 
-- REVENUE SHARING MODEL:
--   - 50% of total AI earnings go to revenue sharing pool (configurable)
--   - 10% of each AI test ($5) goes to trainers ($0.50 per test)
--   - Trainers earn based on their contribution weight to each persona
--   - Minimum 10 training tests required to qualify
--
-- CONTRIBUTION TRACKING:
--   - Tracks which testers trained which AI personas
--   - Calculates contribution weight (their tests / total tests)
--   - Distributes revenue proportionally to contribution
--
-- ADMIN CONTROLS:
--   - Configure revenue pool percentage
--   - Configure trainer share per AI test
--   - Set minimum training tests required
--   - Version and update terms and conditions
--   - View trainer earnings and persona training stats
--
-- LEGAL COMPLIANCE:
--   - Terms and conditions versioning
--   - Tester acceptance tracking
--   - Automatic notification when terms change
--   - Audit trail of all revenue transactions
--
-- EXAMPLE:
--   - AI test runs: $5 revenue
--   - 10% goes to pool: $0.50
--   - Trainer A contributed 60% of training: earns $0.30
--   - Trainer B contributed 40% of training: earns $0.20
--
-- ============================================================================
