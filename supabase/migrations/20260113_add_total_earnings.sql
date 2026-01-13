-- Add total_earnings_usd field to human_testers table
-- This field will be automatically updated when test earnings are recorded

-- Add the field
ALTER TABLE human_testers ADD COLUMN IF NOT EXISTS total_earnings_usd DECIMAL(10,2) DEFAULT 0.00;

-- Create index for performance queries
CREATE INDEX IF NOT EXISTS idx_human_testers_earnings ON human_testers(total_earnings_usd);

-- Create function to update total earnings when a test is completed
CREATE OR REPLACE FUNCTION update_tester_total_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the tester's total earnings
  UPDATE human_testers
  SET total_earnings_usd = (
    SELECT COALESCE(SUM(amount_earned_usd), 0)
    FROM tester_test_history
    WHERE tester_id = NEW.tester_id
  )
  WHERE id = NEW.tester_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total earnings
DROP TRIGGER IF EXISTS trigger_update_tester_earnings ON tester_test_history;
CREATE TRIGGER trigger_update_tester_earnings
  AFTER INSERT OR UPDATE OF amount_earned_usd ON tester_test_history
  FOR EACH ROW
  EXECUTE FUNCTION update_tester_total_earnings();

-- Also update when a test assignment is paid
CREATE OR REPLACE FUNCTION update_tester_earnings_from_assignment()
RETURNS TRIGGER AS $$
DECLARE
  tester_record RECORD;
BEGIN
  -- Get the tester_id from human_test_assignments
  SELECT ht.id INTO tester_record
  FROM human_testers ht
  WHERE ht.user_id = (
    SELECT user_id FROM human_test_assignments WHERE id = NEW.id
  );
  
  IF tester_record.id IS NOT NULL THEN
    -- Update total earnings from all assignments
    UPDATE human_testers
    SET total_earnings_usd = (
      SELECT COALESCE(SUM(hta.amount_earned_usd), 0)
      FROM human_test_assignments hta
      WHERE hta.tester_id = tester_record.id
      AND hta.payment_status = 'paid'
    )
    WHERE id = tester_record.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_earnings_from_assignment ON human_test_assignments;
CREATE TRIGGER trigger_update_earnings_from_assignment
  AFTER UPDATE OF amount_earned_usd, payment_status ON human_test_assignments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid')
  EXECUTE FUNCTION update_tester_earnings_from_assignment();

COMMENT ON COLUMN human_testers.total_earnings_usd IS 'Total lifetime earnings - automatically updated from test history and assignments';
