-- Fix RLS policy for company_members to allow signup
-- Similar issue: During company signup, need to allow INSERT for new company members

-- Drop the old policy that was too restrictive
DROP POLICY IF EXISTS "Company owners can manage members" ON company_members;

-- Create separate policies for different operations
CREATE POLICY "Users can add themselves as company members"
  ON company_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view members of their companies"
  ON company_members FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Company owners can update members"
  ON company_members FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'owner'
  ));

CREATE POLICY "Company owners can delete members"
  ON company_members FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'owner'
  ));

-- Comments
COMMENT ON POLICY "Users can add themselves as company members" ON company_members IS 
  'Allows authenticated users to add themselves as company members during signup';
