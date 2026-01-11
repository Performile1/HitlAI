-- Enhanced Disputes Table (Gemini Recommendation)
-- Replaces basic test_disputes with full escrow and comparison tracking

-- Create dispute status enum
CREATE TYPE dispute_status AS ENUM ('pending', 'processing', 'valid', 'invalid', 'resolved');

-- Enhanced disputes table with full Gemini spec
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES test_runs(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  status dispute_status DEFAULT 'pending',
  
  -- The "Payback" Protection
  conditional_credits_granted INT DEFAULT 10,
  penalty_surcharge_amount DECIMAL(10,2) DEFAULT 5.00,
  
  -- Comparison Data (for Dispute Review Hero UI)
  ai_findings_json JSONB,
  human_findings_json JSONB,
  
  -- Admin Review
  expert_admin_id UUID REFERENCES profiles(id),
  admin_notes TEXT,
  verdict TEXT, -- 'ai_upheld' or 'ai_overruled'
  
  -- Metadata
  reason TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add conditional balance to company_credits for escrow tracking
ALTER TABLE company_credits
ADD COLUMN IF NOT EXISTS conditional_balance INT DEFAULT 0;

-- Persona Patches table (for The Forge)
CREATE TABLE IF NOT EXISTS persona_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) NOT NULL,
  suggested_logic TEXT NOT NULL,
  source_evidence_id UUID REFERENCES human_insights(id),
  status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
  patch_type TEXT DEFAULT 'individual', -- 'individual', 'consensus'
  evidence_count INT DEFAULT 1,
  admin_id UUID REFERENCES profiles(id),
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning Events (tracks when AI learns from human corrections)
CREATE TABLE IF NOT EXISTS ai_learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'dispute_correction', 'persona_patch', 'consensus_update'
  test_run_id UUID REFERENCES test_runs(id),
  persona_id UUID REFERENCES personas(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biometric Scores (Sentinel anti-bot tracking)
CREATE TABLE IF NOT EXISTS biometric_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID REFERENCES human_testers(id) NOT NULL,
  test_run_id UUID REFERENCES test_runs(id),
  humanity_score DECIMAL(3,2) CHECK (humanity_score BETWEEN 0 AND 1),
  mouse_jitter_variance DECIMAL,
  typing_speed_variance DECIMAL,
  focus_event_count INT,
  tab_switch_count INT,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consensus Validations (3-judge rule tracking)
CREATE TABLE IF NOT EXISTS consensus_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) NOT NULL,
  tester_votes JSONB, -- Array of {tester_id, vote, findings}
  agreement_rate DECIMAL(3,2),
  consensus_reached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_disputes_company ON disputes(company_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_persona_patches_persona ON persona_patches(persona_id);
CREATE INDEX idx_persona_patches_status ON persona_patches(status);
CREATE INDEX idx_biometric_scores_tester ON biometric_scores(tester_id);
CREATE INDEX idx_biometric_scores_flagged ON biometric_scores(flagged_for_review);

-- RLS Policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consensus_validations ENABLE ROW LEVEL SECURITY;

-- Companies can only view their own disputes
CREATE POLICY disputes_company_view ON disputes FOR SELECT USING (
  company_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);

-- Only admins can update disputes
CREATE POLICY disputes_admin_update ON disputes FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Only admins can manage persona patches
CREATE POLICY persona_patches_admin_only ON persona_patches FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Testers can view their own biometric scores
CREATE POLICY biometric_scores_tester_view ON biometric_scores FOR SELECT USING (
  tester_id IN (SELECT id FROM human_testers WHERE profile_id = auth.uid())
  OR auth.jwt() ->> 'role' = 'admin'
);
