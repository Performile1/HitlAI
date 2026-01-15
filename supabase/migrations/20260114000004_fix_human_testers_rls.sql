-- Fix RLS policy for human_testers to allow signup
-- The issue: During signup, user is authenticated but the INSERT policy was too restrictive

-- Drop the old INSERT policy
DROP POLICY IF EXISTS "Users can create tester profile" ON human_testers;

-- Create new INSERT policy that allows authenticated users to create their profile
CREATE POLICY "Users can create tester profile"
  ON human_testers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Also ensure the UPDATE policy works correctly
DROP POLICY IF EXISTS "Testers can update their profile" ON human_testers;

CREATE POLICY "Testers can update their profile"
  ON human_testers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments
COMMENT ON POLICY "Users can create tester profile" ON human_testers IS 
  'Allows authenticated users to create their tester profile during signup';
COMMENT ON POLICY "Testers can update their profile" ON human_testers IS 
  'Allows testers to update their own profile';
