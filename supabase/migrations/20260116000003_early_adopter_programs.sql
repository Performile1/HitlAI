-- Migration: Early Adopter Programs
-- Purpose: Track early adopter companies and founding testers with equity

-- Create early_adopter_applications table (companies)
CREATE TABLE IF NOT EXISTS early_adopter_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  
  -- Company details
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  industry TEXT,
  
  -- Application details
  tier_requested TEXT CHECK (tier_requested IN ('founding_partner', 'early_adopter', 'beta_user')),
  monthly_test_commitment INTEGER,
  use_case TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create early_adopter_companies table (approved companies)
CREATE TABLE IF NOT EXISTS early_adopter_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID REFERENCES early_adopter_applications(id),
  
  -- Tier info
  tier TEXT NOT NULL CHECK (tier IN ('founding_partner', 'early_adopter', 'beta_user')),
  tier_number INTEGER,
  
  -- Discount details
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  lifetime_discount BOOLEAN DEFAULT TRUE,
  
  -- Commitment
  monthly_test_commitment INTEGER,
  tests_completed INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- Create founding_tester_applications table
CREATE TABLE IF NOT EXISTS founding_tester_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Professional background
  years_of_experience INTEGER,
  portfolio_url TEXT,
  linkedin_url TEXT,
  previous_testing_platforms TEXT[],
  
  -- Application details
  tier_requested TEXT CHECK (tier_requested IN ('founding_tester', 'early_tester', 'beta_tester')),
  weekly_test_commitment INTEGER,
  specializations TEXT[],
  why_join TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create founding_testers table (approved testers with equity)
CREATE TABLE IF NOT EXISTS founding_testers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  application_id UUID REFERENCES founding_tester_applications(id),
  
  -- Tier info
  tier TEXT NOT NULL CHECK (tier IN ('founding_tester', 'early_tester', 'beta_tester')),
  tier_number INTEGER,
  
  -- Revenue share (enhanced from standard 30%)
  revenue_share_percentage INTEGER NOT NULL CHECK (revenue_share_percentage >= 30 AND revenue_share_percentage <= 50),
  
  -- Equity details
  equity_percentage DECIMAL(5,4),
  equity_shares INTEGER,
  vesting_start_date DATE,
  vesting_duration_months INTEGER DEFAULT 24,
  cliff_months INTEGER DEFAULT 12,
  
  -- Bonuses
  training_bonus_per_test DECIMAL(10,2) DEFAULT 0,
  monthly_retainer DECIMAL(10,2) DEFAULT 0,
  
  -- Performance tracking
  tests_completed INTEGER DEFAULT 0,
  high_quality_tests INTEGER DEFAULT 0,
  training_contributions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tester_id)
);

-- Create tester_equity_vesting table
CREATE TABLE IF NOT EXISTS tester_equity_vesting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founding_tester_id UUID REFERENCES founding_testers(id) ON DELETE CASCADE,
  
  -- Vesting schedule
  vesting_date DATE NOT NULL,
  shares_vested INTEGER NOT NULL,
  cumulative_shares INTEGER NOT NULL,
  
  -- Status
  is_vested BOOLEAN DEFAULT FALSE,
  vested_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(founding_tester_id, vesting_date)
);

-- Create indexes
CREATE INDEX idx_ea_applications_status ON early_adopter_applications(status);
CREATE INDEX idx_ea_applications_email ON early_adopter_applications(email);
CREATE INDEX idx_ea_companies_tier ON early_adopter_companies(tier);
CREATE INDEX idx_ea_companies_company ON early_adopter_companies(company_id);

CREATE INDEX idx_ft_applications_status ON founding_tester_applications(status);
CREATE INDEX idx_ft_applications_email ON founding_tester_applications(email);
CREATE INDEX idx_founding_testers_tier ON founding_testers(tier);
CREATE INDEX idx_founding_testers_tester ON founding_testers(tester_id);

CREATE INDEX idx_equity_vesting_tester ON tester_equity_vesting(founding_tester_id);
CREATE INDEX idx_equity_vesting_date ON tester_equity_vesting(vesting_date);

-- Function to generate vesting schedule
CREATE OR REPLACE FUNCTION generate_vesting_schedule(
  p_founding_tester_id UUID,
  p_equity_shares INTEGER,
  p_vesting_start_date DATE,
  p_vesting_duration_months INTEGER,
  p_cliff_months INTEGER
)
RETURNS void AS $$
DECLARE
  v_month INTEGER;
  v_shares_per_month DECIMAL;
  v_vesting_date DATE;
  v_cumulative_shares INTEGER := 0;
BEGIN
  v_shares_per_month := p_equity_shares::DECIMAL / p_vesting_duration_months;
  
  FOR v_month IN 1..p_vesting_duration_months LOOP
    v_vesting_date := p_vesting_start_date + (v_month || ' months')::INTERVAL;
    
    -- Skip months before cliff
    IF v_month < p_cliff_months THEN
      CONTINUE;
    END IF;
    
    -- At cliff, vest all accumulated shares
    IF v_month = p_cliff_months THEN
      v_cumulative_shares := ROUND(v_shares_per_month * v_month);
    ELSE
      v_cumulative_shares := v_cumulative_shares + ROUND(v_shares_per_month);
    END IF;
    
    INSERT INTO tester_equity_vesting (
      founding_tester_id,
      vesting_date,
      shares_vested,
      cumulative_shares
    ) VALUES (
      p_founding_tester_id,
      v_vesting_date,
      CASE 
        WHEN v_month = p_cliff_months THEN v_cumulative_shares
        ELSE ROUND(v_shares_per_month)
      END,
      v_cumulative_shares
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available spots per tier
CREATE OR REPLACE FUNCTION get_available_spots()
RETURNS TABLE (
  tier TEXT,
  max_spots INTEGER,
  filled_spots BIGINT,
  available_spots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH tier_limits AS (
    SELECT 'founding_partner'::TEXT as tier, 10 as max_spots
    UNION ALL SELECT 'early_adopter', 40
    UNION ALL SELECT 'beta_user', 150
  )
  SELECT 
    tl.tier,
    tl.max_spots,
    COALESCE(COUNT(eac.id), 0) as filled_spots,
    (tl.max_spots - COALESCE(COUNT(eac.id), 0))::INTEGER as available_spots
  FROM tier_limits tl
  LEFT JOIN early_adopter_companies eac ON eac.tier = tl.tier AND eac.status = 'active'
  GROUP BY tl.tier, tl.max_spots;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get founding tester spots
CREATE OR REPLACE FUNCTION get_founding_tester_spots()
RETURNS TABLE (
  tier TEXT,
  max_spots INTEGER,
  filled_spots BIGINT,
  available_spots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH tier_limits AS (
    SELECT 'founding_tester'::TEXT as tier, 20 as max_spots
    UNION ALL SELECT 'early_tester', 30
    UNION ALL SELECT 'beta_tester', 50
  )
  SELECT 
    tl.tier,
    tl.max_spots,
    COALESCE(COUNT(ft.id), 0) as filled_spots,
    (tl.max_spots - COALESCE(COUNT(ft.id), 0))::INTEGER as available_spots
  FROM tier_limits tl
  LEFT JOIN founding_testers ft ON ft.tier = tl.tier AND ft.status = 'active'
  GROUP BY tl.tier, tl.max_spots;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE early_adopter_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_adopter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_tester_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tester_equity_vesting ENABLE ROW LEVEL SECURITY;

-- RLS Policies for early_adopter_applications
CREATE POLICY "Anyone can submit applications"
  ON early_adopter_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own applications"
  ON early_adopter_applications
  FOR SELECT
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage applications"
  ON early_adopter_applications
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for early_adopter_companies
CREATE POLICY "Companies can view their own status"
  ON early_adopter_companies
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage early adopter companies"
  ON early_adopter_companies
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for founding_tester_applications
CREATE POLICY "Anyone can submit tester applications"
  ON founding_tester_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own tester applications"
  ON founding_tester_applications
  FOR SELECT
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage tester applications"
  ON founding_tester_applications
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for founding_testers
CREATE POLICY "Testers can view their own founding status"
  ON founding_testers
  FOR SELECT
  USING (tester_id = auth.uid());

CREATE POLICY "Service role can manage founding testers"
  ON founding_testers
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for tester_equity_vesting
CREATE POLICY "Testers can view their own vesting schedule"
  ON tester_equity_vesting
  FOR SELECT
  USING (founding_tester_id IN (
    SELECT id FROM founding_testers WHERE tester_id = auth.uid()
  ));

CREATE POLICY "Service role can manage vesting"
  ON tester_equity_vesting
  FOR ALL
  USING (auth.role() = 'service_role');
