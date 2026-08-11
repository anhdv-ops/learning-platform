-- ============================================
-- Migration: Create comments table for Lesson Q&A
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by lesson
CREATE INDEX IF NOT EXISTS idx_comments_lesson_id ON comments(lesson_id);

-- Index for fast lookup of replies
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "Authenticated users can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
