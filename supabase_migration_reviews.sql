-- ============================================
-- Migration: Course Reviews & Rating System
-- ============================================

-- 1. Add aggregated rating columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;

-- 2. Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (char_length(comment) <= 2000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_course_review UNIQUE (course_id, user_id)
);

-- Index for fast lookup by course
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);

-- 3. Create Trigger Function to recalculate aggregated stats
CREATE OR REPLACE FUNCTION update_course_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_course_id TEXT;
  calc_avg NUMERIC(3, 2);
  calc_count INT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    target_course_id := OLD.course_id;
  ELSE
    target_course_id := NEW.course_id;
  END IF;

  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
    COUNT(*)
  INTO calc_avg, calc_count
  FROM course_reviews
  WHERE course_id = target_course_id;

  UPDATE courses
  SET 
    rating_avg = calc_avg,
    rating_count = calc_count
  WHERE id = target_course_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger on course_reviews table
DROP TRIGGER IF EXISTS trg_update_course_rating ON course_reviews;
CREATE TRIGGER trg_update_course_rating
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW EXECUTE FUNCTION update_course_rating_stats();

-- 5. Row Level Security (RLS)
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Public reviews read access"
  ON course_reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "Users can insert their own review"
  ON course_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY "Users can update their own review"
  ON course_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own review
CREATE POLICY "Users can delete their own review"
  ON course_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
