-- Migration: Early Adopter Applications
-- Description: Table for managing early access program applications
-- Created: 2026-01-19

CREATE TABLE IF NOT EXISTS early_adopter_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  
  -- Company Details
  company_size TEXT NOT NULL,
  industry TEXT,
  
  -- Testing Requirements
  testing_needs TEXT,
  monthly_test_volume TEXT NOT NULL,
  current_tools TEXT,
  pain_points TEXT,
  
  -- Interest & Features
  interested_features TEXT[] DEFAULT '{}',
  referral_source TEXT,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'waitlisted'
  priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  
  -- Review Process
  reviewed_by UUID, -- References auth.users
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Approval Details
  approved_at TIMESTAMPTZ,
  access_granted_at TIMESTAMPTZ,
  invitation_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_early_adopter_applications_email ON early_adopter_applications(email);
CREATE INDEX idx_early_adopter_applications_status ON early_adopter_applications(status);
CREATE INDEX idx_early_adopter_applications_priority ON early_adopter_applications(priority_score DESC);
CREATE INDEX idx_early_adopter_applications_submitted ON early_adopter_applications(submitted_at DESC);
CREATE INDEX idx_early_adopter_applications_pending ON early_adopter_applications(status) WHERE status = 'pending';

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_early_adopter_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_early_adopter_applications_updated_at
BEFORE UPDATE ON early_adopter_applications
FOR EACH ROW
EXECUTE FUNCTION update_early_adopter_applications_updated_at();

-- Comments
COMMENT ON TABLE early_adopter_applications IS 'Stores applications for the early adopter program';
COMMENT ON COLUMN early_adopter_applications.priority_score IS 'Calculated score based on company size, volume, and interest (0-100)';
COMMENT ON COLUMN early_adopter_applications.status IS 'Application status: pending, approved, rejected, waitlisted';
