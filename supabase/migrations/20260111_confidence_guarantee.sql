-- Confidence Guarantee & Dispute Resolution System

CREATE TABLE test_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id),
  company_id UUID REFERENCES companies(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  human_validation_credits INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dispute_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES test_disputes(id),
  resolution TEXT,
  ai_was_correct BOOLEAN,
  penalty_fee DECIMAL,
  refund_amount INT,
  resolved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_dispute_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_multiplier INT DEFAULT 10,
  penalty_fee DECIMAL DEFAULT 5.00,
  human_sample_size INT DEFAULT 3,
  agreement_threshold DECIMAL DEFAULT 0.70
);

ALTER TABLE test_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
