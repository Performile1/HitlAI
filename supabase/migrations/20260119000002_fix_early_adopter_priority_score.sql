-- Migration: Fix Early Adopter Applications - Add priority_score if missing
-- Description: Adds priority_score column if it doesn't exist
-- Created: 2026-01-19

-- Add priority_score column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'early_adopter_applications' 
    AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE early_adopter_applications 
    ADD COLUMN priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100);
    
    -- Add index if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = 'early_adopter_applications' 
      AND indexname = 'idx_early_adopter_applications_priority'
    ) THEN
      CREATE INDEX idx_early_adopter_applications_priority ON early_adopter_applications(priority_score DESC);
    END IF;
    
    -- Add comment
    COMMENT ON COLUMN early_adopter_applications.priority_score IS 'Calculated score based on company size, volume, and interest (0-100)';
  END IF;
END $$;
