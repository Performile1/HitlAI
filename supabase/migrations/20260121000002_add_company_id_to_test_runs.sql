-- Migration: Add company_id to test_runs table
-- Purpose: Link test runs to companies for milestone tracking
-- Date: 2026-01-21

-- Add company_id column to test_runs
ALTER TABLE test_runs 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create index for company_id lookups
CREATE INDEX IF NOT EXISTS idx_test_runs_company_id ON test_runs(company_id);

-- Add company_ai_rating column for quality tracking
ALTER TABLE test_runs
ADD COLUMN IF NOT EXISTS company_ai_rating INTEGER CHECK (company_ai_rating >= 1 AND company_ai_rating <= 5);

-- Function to auto-populate company_id from user_id
CREATE OR REPLACE FUNCTION set_test_run_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If company_id is not set, try to get it from the user's company membership
  IF NEW.company_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT cm.company_id INTO NEW.company_id
    FROM company_members cm
    WHERE cm.user_id = NEW.user_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set company_id on insert
DROP TRIGGER IF EXISTS trigger_set_test_run_company_id ON test_runs;
CREATE TRIGGER trigger_set_test_run_company_id
  BEFORE INSERT ON test_runs
  FOR EACH ROW
  EXECUTE FUNCTION set_test_run_company_id();

-- Backfill existing test_runs with company_id from user's company membership
UPDATE test_runs tr
SET company_id = cm.company_id
FROM company_members cm
WHERE tr.user_id = cm.user_id
  AND tr.company_id IS NULL;

COMMENT ON COLUMN test_runs.company_id IS 'Links test run to a company for milestone tracking';
COMMENT ON COLUMN test_runs.company_ai_rating IS 'AI quality rating (1-5 stars) for milestone tracking';
