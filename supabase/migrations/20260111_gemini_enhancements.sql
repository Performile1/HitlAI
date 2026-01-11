-- HitlAI Gemini Enhancements Migration
-- Adds: Human Insights, Tester Annotations, Persona Forge, Shadow Tester, Credits

-- 1. Human Insights (The Moat)
CREATE TABLE human_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id),
  persona_id UUID REFERENCES personas(id),
  content TEXT NOT NULL,
  embedding vector(1536),
  severity_score INT CHECK (severity_score BETWEEN 1 AND 5),
  ui_element_path TEXT,
  tags TEXT[],
  evidence_type TEXT,
  validated_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_human_insights_embedding ON human_insights USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_human_insights_persona ON human_insights(persona_id);

-- 2. Tester Annotations
CREATE TABLE tester_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id),
  timestamp_ms INT NOT NULL,
  position JSONB,
  annotation_type TEXT,
  severity TEXT,
  text TEXT NOT NULL,
  screenshot_url TEXT,
  markup JSONB,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Persona Forge Extensions
ALTER TABLE personas 
ADD COLUMN demographic_data JSONB DEFAULT '{}',
ADD COLUMN logic_overrides JSONB DEFAULT '{}',
ADD COLUMN evidence_count INT DEFAULT 0,
ADD COLUMN validation_checkmark BOOLEAN DEFAULT FALSE,
ADD COLUMN version INT DEFAULT 1;

-- 4. Shadow Tester Mode
CREATE TABLE shadow_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID REFERENCES test_runs(id),
  human_tester_id UUID REFERENCES human_testers(id),
  ai_findings JSONB,
  human_findings JSONB,
  discrepancies JSONB,
  expert_review_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Credits System
CREATE TABLE company_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) UNIQUE,
  balance INT DEFAULT 0,
  total_purchased INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  amount INT NOT NULL,
  type TEXT,
  test_run_id UUID REFERENCES test_runs(id),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. App Uploads
ALTER TABLE test_requests
ADD COLUMN app_file_url TEXT,
ADD COLUMN app_type TEXT,
ADD COLUMN malware_scan_status TEXT DEFAULT 'pending';

-- RLS Policies
ALTER TABLE human_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tester_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_credits ENABLE ROW LEVEL SECURITY;

-- Admin only for personas
CREATE POLICY personas_admin_only ON personas FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
