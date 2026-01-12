-- Admin Controls and HitlAI-Funded Tests Migration
-- Created: 2026-01-12
-- Purpose: Add platform settings, admin controls, and HitlAI-funded test tracking

-- ============================================================================
-- 1. Platform Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- AI/Human Ratio Settings
  default_ai_percentage INT DEFAULT 80 CHECK (default_ai_percentage >= 0 AND default_ai_percentage <= 100),
  default_human_percentage INT DEFAULT 20 CHECK (default_human_percentage >= 0 AND default_human_percentage <= 100),
  allow_custom_ratio BOOLEAN DEFAULT true,
  min_human_tests_per_batch INT DEFAULT 20,
  
  -- Pricing Settings
  human_test_price DECIMAL(10,2) DEFAULT 25.00,
  ai_test_price DECIMAL(10,2) DEFAULT 5.00,
  platform_fee_percent INT DEFAULT 20 CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  
  -- HitlAI-Funded Test Settings
  hitlai_funded_enabled BOOLEAN DEFAULT false,
  hitlai_monthly_budget DECIMAL(10,2) DEFAULT 5000.00,
  hitlai_current_spend DECIMAL(10,2) DEFAULT 0.00,
  hitlai_budget_reset_date DATE DEFAULT DATE_TRUNC('month', NOW()),
  
  -- Payment Options
  cash_payment_enabled BOOLEAN DEFAULT true,
  equity_payment_enabled BOOLEAN DEFAULT false,
  hybrid_payment_enabled BOOLEAN DEFAULT false,
  equity_shares_per_test INT DEFAULT 20, -- shares granted per test
  
  -- AI Learning Settings
  auto_retrain_threshold INT DEFAULT 100, -- retrain after N new human tests
  confidence_threshold DECIMAL(3,2) DEFAULT 0.85, -- 85% confidence minimum
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO platform_settings (id) 
VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. HitlAI-Funded Tests Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS hitlai_funded_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  
  -- Funding Details
  reason VARCHAR(50) CHECK (reason IN ('early_stage', 'new_feature', 'quality_check', 'tester_acquisition', 'ai_training')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'equity', 'hybrid')),
  
  -- Cost Tracking
  amount_spent_cash DECIMAL(10,2) DEFAULT 0.00,
  equity_granted_shares INT DEFAULT 0,
  equity_value_usd DECIMAL(10,2) DEFAULT 0.00,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (amount_spent_cash + equity_value_usd) STORED,
  
  -- Test Details
  num_tests_funded INT DEFAULT 0,
  test_type VARCHAR(100), -- 'ecommerce', 'saas', 'mobile', etc.
  
  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP DEFAULT NOW(),
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hitlai_funded_test_request ON hitlai_funded_tests(test_request_id);
CREATE INDEX idx_hitlai_funded_reason ON hitlai_funded_tests(reason);
CREATE INDEX idx_hitlai_funded_approved_at ON hitlai_funded_tests(approved_at);

-- ============================================================================
-- 3. Tester Equity Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS tester_equity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  
  -- Equity Details
  shares_granted INT NOT NULL,
  share_price_usd DECIMAL(10,2) DEFAULT 1.00,
  total_value_usd DECIMAL(10,2) GENERATED ALWAYS AS (shares_granted * share_price_usd) STORED,
  
  -- Vesting Schedule
  vesting_schedule JSONB DEFAULT '{"cliff_months": 12, "duration_months": 48, "vested_percent": 0}',
  cliff_date DATE,
  fully_vested_date DATE,
  
  -- Source
  source VARCHAR(50) CHECK (source IN ('hitlai_funded_test', 'bonus', 'referral', 'performance')),
  test_ids UUID[], -- array of test IDs that earned these shares
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'vesting', 'vested', 'forfeited')),
  
  -- Metadata
  granted_date TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX idx_tester_equity_tester ON tester_equity(tester_id);
CREATE INDEX idx_tester_equity_status ON tester_equity(status);
CREATE INDEX idx_tester_equity_granted_date ON tester_equity(granted_date);

-- ============================================================================
-- 4. Extend test_requests Table
-- ============================================================================
ALTER TABLE test_requests 
ADD COLUMN IF NOT EXISTS ai_percentage INT DEFAULT 80 CHECK (ai_percentage >= 0 AND ai_percentage <= 100),
ADD COLUMN IF NOT EXISTS human_percentage INT DEFAULT 20 CHECK (human_percentage >= 0 AND human_percentage <= 100),
ADD COLUMN IF NOT EXISTS payment_source VARCHAR(20) DEFAULT 'company' CHECK (payment_source IN ('company', 'hitlai_funded', 'hybrid')),
ADD COLUMN IF NOT EXISTS funding_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_cost_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_cost_usd DECIMAL(10,2);

-- ============================================================================
-- 5. AI Digital Twin Performance Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS digital_twin_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Twin Identification
  twin_type VARCHAR(50) CHECK (twin_type IN ('master', 'accessibility', 'ecommerce', 'saas', 'mobile', 'senior', 'gen_z', 'gaming')),
  twin_name VARCHAR(100),
  
  -- Performance Metrics
  accuracy_percent DECIMAL(5,2) DEFAULT 0.00,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  total_training_tests INT DEFAULT 0,
  total_predictions INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  false_positives INT DEFAULT 0,
  false_negatives INT DEFAULT 0,
  
  -- Training Status
  status VARCHAR(20) DEFAULT 'training' CHECK (status IN ('training', 'production', 'needs_data', 'deprecated')),
  last_retrain_date TIMESTAMP,
  next_retrain_date TIMESTAMP,
  
  -- Recommendations
  needs_more_data BOOLEAN DEFAULT false,
  recommended_tests_needed INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_digital_twin_type ON digital_twin_performance(twin_type);
CREATE INDEX idx_digital_twin_status ON digital_twin_performance(status);

-- Insert default digital twins
INSERT INTO digital_twin_performance (twin_type, twin_name, status) VALUES
  ('master', 'Master Digital Twin', 'production'),
  ('accessibility', 'Accessibility Specialist', 'training'),
  ('ecommerce', 'E-commerce Specialist', 'production'),
  ('saas', 'SaaS Dashboard Specialist', 'training'),
  ('mobile', 'Mobile App Specialist', 'training'),
  ('senior', 'Senior User (60+) Twin', 'training'),
  ('gen_z', 'Gen Z User Twin', 'training')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. Budget Tracking Functions
-- ============================================================================

-- Function to check if HitlAI has budget available
CREATE OR REPLACE FUNCTION check_hitlai_budget(required_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  settings RECORD;
  available_budget DECIMAL;
BEGIN
  SELECT * INTO settings FROM platform_settings LIMIT 1;
  
  -- Reset budget if new month
  IF settings.hitlai_budget_reset_date < DATE_TRUNC('month', NOW()) THEN
    UPDATE platform_settings 
    SET hitlai_current_spend = 0.00,
        hitlai_budget_reset_date = DATE_TRUNC('month', NOW());
    available_budget := settings.hitlai_monthly_budget;
  ELSE
    available_budget := settings.hitlai_monthly_budget - settings.hitlai_current_spend;
  END IF;
  
  RETURN available_budget >= required_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to update HitlAI spend
CREATE OR REPLACE FUNCTION update_hitlai_spend(amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE platform_settings 
  SET hitlai_current_spend = hitlai_current_spend + amount,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Auto-update Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_twin_performance_updated_at
  BEFORE UPDATE ON digital_twin_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitlai_funded_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tester_equity ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_performance ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write platform settings
CREATE POLICY admin_platform_settings ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage HitlAI-funded tests
CREATE POLICY admin_hitlai_funded_tests ON hitlai_funded_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Testers can view their own equity
CREATE POLICY tester_view_own_equity ON tester_equity
  FOR SELECT USING (tester_id IN (
    SELECT id FROM human_testers WHERE user_id = auth.uid()
  ));

-- Admins can manage all equity
CREATE POLICY admin_manage_equity ON tester_equity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can view digital twin performance (transparency)
CREATE POLICY public_view_digital_twins ON digital_twin_performance
  FOR SELECT USING (true);

-- Only admins can update digital twin performance
CREATE POLICY admin_update_digital_twins ON digital_twin_performance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 9. Helpful Views
-- ============================================================================

-- View: Current platform settings (easy access)
CREATE OR REPLACE VIEW current_platform_settings AS
SELECT * FROM platform_settings LIMIT 1;

-- View: HitlAI budget status
CREATE OR REPLACE VIEW hitlai_budget_status AS
SELECT 
  hitlai_monthly_budget as monthly_budget,
  hitlai_current_spend as current_spend,
  (hitlai_monthly_budget - hitlai_current_spend) as remaining_budget,
  ROUND((hitlai_current_spend / hitlai_monthly_budget * 100), 2) as spend_percent,
  hitlai_budget_reset_date as reset_date
FROM platform_settings
LIMIT 1;

-- View: Tester equity summary
CREATE OR REPLACE VIEW tester_equity_summary AS
SELECT 
  tester_id,
  SUM(shares_granted) as total_shares,
  SUM(total_value_usd) as total_value_usd,
  COUNT(*) as equity_grants,
  MAX(granted_date) as last_grant_date
FROM tester_equity
WHERE status IN ('vesting', 'vested')
GROUP BY tester_id;

-- ============================================================================
-- 10. Comments for Documentation
-- ============================================================================

COMMENT ON TABLE platform_settings IS 'Global platform configuration for AI/human ratios, pricing, and HitlAI-funded tests';
COMMENT ON TABLE hitlai_funded_tests IS 'Tracks tests funded by HitlAI for AI training and strategic purposes';
COMMENT ON TABLE tester_equity IS 'Manages equity grants to human testers as alternative compensation';
COMMENT ON TABLE digital_twin_performance IS 'Tracks accuracy and performance metrics for each AI digital twin';

COMMENT ON COLUMN platform_settings.min_human_tests_per_batch IS 'Minimum human tests required per batch for AI learning';
COMMENT ON COLUMN hitlai_funded_tests.reason IS 'Why HitlAI is funding this test (early_stage, new_feature, quality_check, etc.)';
COMMENT ON COLUMN tester_equity.vesting_schedule IS 'JSON object defining cliff and vesting duration in months';
COMMENT ON COLUMN digital_twin_performance.needs_more_data IS 'Flag indicating twin needs more training data to improve accuracy';
