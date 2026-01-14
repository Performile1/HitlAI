-- Add test fixtures and test paths columns to test_requests table

-- Add test_fixtures column (JSONB to store login credentials, cards, coupons, etc.)
ALTER TABLE test_requests
ADD COLUMN IF NOT EXISTS test_fixtures JSONB DEFAULT '{
  "loginCredentials": [],
  "testCards": [],
  "coupons": [],
  "testData": []
}'::jsonb;

-- Add test_paths column (JSONB to store happy path and negative paths)
ALTER TABLE test_requests
ADD COLUMN IF NOT EXISTS test_paths JSONB DEFAULT '{
  "happyPath": "",
  "negativePaths": []
}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN test_requests.test_fixtures IS 'Test data fixtures (logins, cards, coupons) that testers can use';
COMMENT ON COLUMN test_requests.test_paths IS 'Test paths including happy path and negative test scenarios';

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_test_requests_test_fixtures ON test_requests USING GIN (test_fixtures);
CREATE INDEX IF NOT EXISTS idx_test_requests_test_paths ON test_requests USING GIN (test_paths);
