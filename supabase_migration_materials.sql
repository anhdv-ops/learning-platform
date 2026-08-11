-- ============================================
-- Migration: Create lesson_materials table & Supabase Storage Bucket + Policies
-- Updated: User ownership & Lesson context description
-- ============================================

-- 1. Create table lesson_materials with user_id ownership & description field
CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Người upload
  title TEXT NOT NULL,
  description TEXT DEFAULT '', -- Ghi chú/Mô tả nội dung liên quan đến bài học
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'video', 'document', 'other'
  file_size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by lesson & user
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_user_id ON lesson_materials(user_id);

-- 2. Row Level Security for Database Table
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read materials" ON lesson_materials;
CREATE POLICY "Authenticated users can read materials"
  ON lesson_materials FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own materials" ON lesson_materials;
CREATE POLICY "Users can insert their own materials"
  ON lesson_materials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete only their own materials" ON lesson_materials;
CREATE POLICY "Users can delete only their own materials"
  ON lesson_materials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Create Storage Bucket 'lesson-materials' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-materials', 'lesson-materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Row Level Security (RLS) Policies for 'storage.objects'
DROP POLICY IF EXISTS "Allow authenticated uploads to lesson-materials" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to lesson-materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-materials');

DROP POLICY IF EXISTS "Allow public read from lesson-materials" ON storage.objects;
CREATE POLICY "Allow public read from lesson-materials"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lesson-materials');

DROP POLICY IF EXISTS "Allow authenticated deletes from lesson-materials" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from lesson-materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lesson-materials' AND (owner = auth.uid() OR owner IS NULL));
