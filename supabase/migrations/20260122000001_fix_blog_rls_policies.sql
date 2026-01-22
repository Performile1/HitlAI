-- Fix Blog RLS Policies
-- Replace user_type metadata check with direct email check for admin@hitlai.com

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage post categories" ON blog_post_categories;

-- Recreate admin policies with email check instead of metadata
CREATE POLICY "Admins can manage posts"
ON blog_posts FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
);

CREATE POLICY "Admins can manage categories"
ON blog_categories FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
);

CREATE POLICY "Admins can manage post categories"
ON blog_post_categories FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@hitlai.com'
);
