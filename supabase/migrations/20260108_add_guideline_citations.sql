-- Add guideline_citation column to friction_points table
-- This enables tracing friction points back to evidence-based UX guidelines

ALTER TABLE friction_points
ADD COLUMN guideline_citation TEXT;

-- Add index for filtering by guideline
CREATE INDEX idx_friction_points_guideline ON friction_points(guideline_citation);

-- Add comment explaining the column
COMMENT ON COLUMN friction_points.guideline_citation IS 'Reference to UX guideline (e.g., BAY-001, NNG-003, WCAG-001) that supports this friction point finding';
