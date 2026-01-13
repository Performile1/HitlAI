-- Supabase Storage Buckets Setup
-- Run this in Supabase SQL Editor or via CLI

-- 1. Create persona-avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('persona-avatars', 'persona-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create screenshots bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create test-recordings bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-recordings', 'test-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Create reports bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Create test-apps bucket (private) for APK/IPA uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-apps', 
  'test-apps', 
  false,
  524288000, -- 500MB limit
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Persona Avatars: Anyone can read, system can write
CREATE POLICY "Public can view persona avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'persona-avatars');

CREATE POLICY "System can upload persona avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'persona-avatars' AND auth.role() = 'service_role');

-- Screenshots: Anyone can read, system can write
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');

CREATE POLICY "System can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'screenshots');

-- Test Recordings: Only company members can access their recordings
CREATE POLICY "Company members can view their test recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'test-recordings' AND
  EXISTS (
    SELECT 1 FROM test_runs tr
    JOIN company_members cm ON cm.company_id = tr.company_id
    WHERE tr.id::text = (storage.foldername(name))[1]
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "System can upload test recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'test-recordings');

-- Reports: Only company members can access their reports
CREATE POLICY "Company members can view their reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' AND
  EXISTS (
    SELECT 1 FROM test_runs tr
    JOIN company_members cm ON cm.company_id = tr.company_id
    WHERE tr.id::text = (storage.foldername(name))[1]
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "System can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');

-- Test Apps: Companies can upload and view their own app files
CREATE POLICY "Companies can upload test apps"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'test-apps' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Companies can view their test apps"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'test-apps' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Companies can delete their test apps"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'test-apps' AND
  auth.uid() IS NOT NULL
);
