-- =====================================================
-- Create Issues Table
-- Track bugs and issues found during testing
-- =====================================================

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  
  -- Issue details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity severity_level NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  
  -- Context
  url TEXT,
  element_selector TEXT,
  screenshot_url TEXT,
  video_url TEXT,
  
  -- Categorization
  category TEXT, -- e.g., 'navigation', 'forms', 'performance', 'accessibility'
  tags TEXT[],
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_issues_test_run ON issues(test_run_id);
CREATE INDEX idx_issues_company ON issues(company_id);
CREATE INDEX idx_issues_tester ON issues(tester_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);

-- RLS Policies
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Companies can view their own issues
CREATE POLICY "Companies can view their own issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

-- Testers can view issues they found
CREATE POLICY "Testers can view issues they found"
  ON issues FOR SELECT
  TO authenticated
  USING (
    tester_id IN (
      SELECT id FROM human_testers
      WHERE user_id = auth.uid()
    )
  );

-- Testers can create issues
CREATE POLICY "Testers can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (
    tester_id IN (
      SELECT id FROM human_testers
      WHERE user_id = auth.uid()
    )
  );

-- Companies can update their issues (status, resolution)
CREATE POLICY "Companies can update their issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_issues_updated_at();

COMMENT ON TABLE issues IS 'Bugs and issues found during testing';
