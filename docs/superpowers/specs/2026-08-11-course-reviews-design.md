# Course Reviews & Rating System Design Document

**Date:** 2026-08-11
**Feature:** Course Reviews & Rating System (Đánh giá & Review khóa học)
**Status:** Approved by User (Option 1 - Supabase Trigger & Aggregations)

---

## 1. Overview & Goals

The Course Reviews & Rating system allows enrolled students to submit rating stars (1 to 5 stars) and write written reviews for courses they have registered for. The system automatically computes aggregate rating statistics (average rating score e.g., 4.8 ★, total review count, and star distribution) directly in Supabase PostgreSQL using database triggers.

Key user-facing features:
- Display calculated average rating & review count on `<CourseCard />` in course catalog and user enrolled courses page.
- Detailed rating breakdown (average score, star distribution percentages 1-5★) on the Course Detail page (`/courses/[id]`).
- Interactive review submission form (star picker, comment input) restricted to enrolled users.
- Ability for students to edit or delete their submitted reviews.
- Responsive, accessible, and high-aesthetics UI adhering to existing design system guidelines (dark glassmorphism, gold star highlights, smooth transitions).

---

## 2. Database & Aggregations Schema (Supabase)

### Migration SQL (`supabase_migration_reviews.sql`)

```sql
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
```

---

## 3. Data Models & TypeScript Types

### `@/types/review.ts`

```typescript
export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userFullName?: string;
}

export interface CourseRatingStats {
  ratingAvg: number;
  ratingCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

### `@/types/course.ts` (Updates)

```typescript
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: 'S' | 'Pres' | 'TC' | 'MTC';
  kindOfCourse: string;
  totalLessons: number;
  progress: number;
  status?: string;
  ratingAvg: number;
  ratingCount: number;
  lessons: Lesson[];
}
```

---

## 4. API & Server Actions

### Data Layer (`src/lib/api.ts`)
- Update `getCourses`, `getCourseById`, `getMyCourses` to select `rating_avg` and `rating_count` from Supabase `courses` table and map them to `ratingAvg` and `ratingCount`.

### Server Action Layer (`src/actions/reviews.ts`)
- `getCourseReviews(courseId: string)`:
  - Fetches list of reviews ordered by `created_at DESC`.
  - Maps user display names/emails using `profiles` table fallback.
  - Computes rating distribution percentages for 1 to 5 stars.
- `getUserCourseReview(courseId: string)`:
  - Fetches authenticated user's existing review for this course (if logged in).
- `addOrUpdateCourseReview(courseId: string, rating: number, comment: string)`:
  - Validates user session.
  - Verifies enrollment in `enrollments` table (returns error if not enrolled).
  - Validates `rating` between 1 and 5.
  - Upserts into `course_reviews`.
  - Calls `revalidatePath('/courses')` and `revalidatePath('/courses/' + courseId)`.
- `deleteCourseReview(courseId: string, reviewId: string)`:
  - Validates ownership.
  - Deletes record from `course_reviews`.
  - Revalidates paths.

---

## 5. UI Components & Layout Integration

### A. `<CourseCard />` (`src/components/CourseCard.tsx`)
- Display rating badge:
  - Stars icon in amber gold (`text-amber-400`).
  - Average score formatted to 1 decimal place (e.g. `4.8`).
  - Review count in parentheses e.g. `(12)`.
  - If `ratingCount === 0`, display `★ Mới`.

### B. `<CourseReviewsSection />` (`src/components/CourseReviewsSection.tsx`)
- Client component rendered on `/courses/[id]` page.
- **Header Summary Card:**
  - Large overall rating number (e.g., `4.8 / 5.0`).
  - Rendered star icons (filled, half, empty).
  - Total review count.
  - 5-star distribution bar chart with interactive progress bars (5★ to 1★ percentages).
- **Interactive Review Form (for Enrolled Users):**
  - Star selection (hover and click feedback with animated star icons).
  - Optional comment box (max 2000 chars, character counter).
  - Submit / Update button + Delete button if review already exists.
  - Alert banner if non-enrolled or unauthenticated user tries to interact.
- **Reviews List:**
  - Cards per review displaying user avatar/initials, user name/email, star rating badge, formatted creation date, and comment body.

---

## 6. Verification Plan

1. **Database Migration Verification:**
   - Execute `supabase_migration_reviews.sql` or apply structure via Supabase dashboard / query.
   - Verify table creation, indexes, and trigger functions.
2. **Functional Verification:**
   - Enroll as a student, navigate to course detail page.
   - Verify non-enrolled user cannot post a review.
   - Post a 5-star review as enrolled user -> Verify trigger updates `courses.rating_avg` and `courses.rating_count`.
   - Check `<CourseCard />` on `/courses` listing page -> Verify `4.8 ★ (1)` badge appears correctly.
   - Update review to 4 stars -> Verify recalculation.
   - Delete review -> Verify count drops to 0 and card shows `★ Mới`.
