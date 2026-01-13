-- Enhanced Storage Buckets for Testing Features
-- Run this in Supabase SQL Editor

-- Screenshots Storage Bucket (for annotation screenshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- Test Recordings Storage Bucket (for screen recordings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-recordings',
  'test-recordings',
  true,
  524288000, -- 500MB
  ARRAY['video/webm', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Testers can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view recordings" ON storage.objects;
DROP POLICY IF EXISTS "Testers can delete their recordings" ON storage.objects;

-- Screenshots Policies
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Authenticated users can view screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'screenshots');

CREATE POLICY "Users can delete their own screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'screenshots');

-- Test Recordings Policies
CREATE POLICY "Testers can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'test-recordings' AND
  auth.uid() IN (
    SELECT profile_id FROM human_testers
  )
);

CREATE POLICY "Authenticated users can view recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'test-recordings');

CREATE POLICY "Testers can delete their recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'test-recordings' AND
  auth.uid() IN (
    SELECT profile_id FROM human_testers
  )
);
