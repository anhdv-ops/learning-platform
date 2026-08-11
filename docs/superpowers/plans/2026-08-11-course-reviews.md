# Course Reviews & Rating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Course Reviews & Rating feature with Supabase database trigger aggregations and responsive Next.js client/server UI.

**Architecture:** Create a `course_reviews` table in Supabase with PostgreSQL trigger function that automatically updates `rating_avg` and `rating_count` on the `courses` table. Expose Server Actions for submitting, updating, and deleting reviews for enrolled users. Display rating stats on `CourseCard` and a full review/rating breakdown section on the course detail page.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase (PostgreSQL, Triggers, RLS, Auth), Tailwind CSS, Lucide / Inline SVG icons.

## Global Constraints
- Only enrolled users can post/edit/delete reviews.
- RLS policies must protect `course_reviews` table.
- Rating values must be strictly between 1 and 5.
- `CourseCard` displays average score (formatted to 1 decimal place e.g., 4.8 ★) and total count e.g., (12). If count is 0, display `★ Mới`.

---

### Task 1: Database Migration SQL File & Supabase Triggers

**Files:**
- Create: `supabase_migration_reviews.sql`

**Interfaces:**
- Consumes: `courses`, `auth.users`
- Produces: `course_reviews` table, `rating_avg` and `rating_count` columns on `courses`, `trg_update_course_rating` trigger.

- [ ] **Step 1: Create `supabase_migration_reviews.sql`**

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

- [ ] **Step 2: Commit Task 1**

```bash
git add supabase_migration_reviews.sql
git commit -m "feat(db): add course_reviews table migration with triggers and RLS policies"
```

---

### Task 2: Data Models & Types

**Files:**
- Create: `src/types/review.ts`
- Modify: `src/types/course.ts`

**Interfaces:**
- Consumes: None
- Produces: `CourseReview`, `CourseRatingStats` in `src/types/review.ts`, `ratingAvg`, `ratingCount` fields in `Course` in `src/types/course.ts`

- [ ] **Step 1: Create `src/types/review.ts`**

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

- [ ] **Step 2: Modify `src/types/course.ts`**

```typescript
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: number;
  url: string;
  description: string;
  status: 'not-started' | 'completed';
  order: number;
}

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
  ratingAvg?: number;
  ratingCount?: number;
  lessons: Lesson[];
}
```

- [ ] **Step 3: Commit Task 2**

```bash
git add src/types/review.ts src/types/course.ts
git commit -m "feat(types): define CourseReview interface and update Course type with rating properties"
```

---

### Task 3: Update API Layer for Course Ratings

**Files:**
- Modify: `src/lib/api.ts`

**Interfaces:**
- Consumes: `courses` table from Supabase
- Produces: `getCourses`, `getCourseById`, `getMyCourses` returning `ratingAvg` and `ratingCount` on `Course` objects.

- [ ] **Step 1: Update `src/lib/api.ts` mapping**

Ensure `getCourses`, `getCourseById`, and `getMyCourses` map `c.rating_avg` and `c.rating_count`:

```typescript
// In getCourses:
return {
  id: c.id,
  title: c.title,
  description: c.description,
  thumbnail: c.thumbnail,
  level: c.level,
  kindOfCourse: c.kind_of_course || c.kindOfCourse,
  totalLessons,
  progress,
  status,
  ratingAvg: Number(c.rating_avg) || 0,
  ratingCount: Number(c.rating_count) || 0,
  lessons: [],
}

// In getCourseById:
return {
  id: courseData.id,
  title: courseData.title,
  description: courseData.description,
  thumbnail: courseData.thumbnail,
  level: courseData.level,
  kindOfCourse: courseData.kind_of_course || courseData.kindOfCourse,
  totalLessons,
  progress,
  status: progress === 100 ? 'completed' : 'in-progress',
  ratingAvg: Number(courseData.rating_avg) || 0,
  ratingCount: Number(courseData.rating_count) || 0,
  lessons,
}

// In getMyCourses:
return {
  id: c.id,
  title: c.title,
  description: c.description,
  thumbnail: c.thumbnail,
  level: c.level,
  kindOfCourse: c.kind_of_course || c.kindOfCourse,
  totalLessons,
  progress,
  status,
  ratingAvg: Number(c.rating_avg) || 0,
  ratingCount: Number(c.rating_count) || 0,
  lessons: [],
}
```

- [ ] **Step 2: Commit Task 3**

```bash
git add src/lib/api.ts
git commit -m "feat(api): include ratingAvg and ratingCount in course queries"
```

---

### Task 4: Create Server Actions for Course Reviews

**Files:**
- Create: `src/actions/reviews.ts`

**Interfaces:**
- Consumes: Supabase server client (`@/lib/supabase/server`), `course_reviews` table, `enrollments` table.
- Produces: `getCourseReviews`, `getUserCourseReview`, `addOrUpdateReview`, `deleteReview` server actions.

- [ ] **Step 1: Create `src/actions/reviews.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CourseReview, CourseRatingStats } from '@/types/review'

export async function getCourseReviews(courseId: string): Promise<{
  reviews: CourseReview[];
  stats: CourseRatingStats;
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  const emptyStats: CourseRatingStats = {
    ratingAvg: 0,
    ratingCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  }

  if (error || !data) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error)
    return { reviews: [], stats: emptyStats }
  }

  // Calculate distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  const userIds = [...new Set(data.map((r: any) => r.user_id))]
  const nameMap: Record<string, string> = {}

  for (const uid of userIds) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', uid)
        .maybeSingle()

      if (profileData?.full_name || profileData?.email) {
        nameMap[uid] = profileData.full_name || profileData.email
      } else {
        nameMap[uid] = `Học viên ...${uid.slice(-4)}`
      }
    } catch {
      nameMap[uid] = `Học viên ...${uid.slice(-4)}`
    }
  }

  const reviews: CourseReview[] = data.map((r: any) => {
    const star = Math.min(5, Math.max(1, Number(r.rating) || 5))
    if (star >= 1 && star <= 5) {
      distribution[star as 1|2|3|4|5] = (distribution[star as 1|2|3|4|5] || 0) + 1
    }
    sum += star

    return {
      id: r.id,
      courseId: r.course_id,
      userId: r.user_id,
      rating: star,
      comment: r.comment || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userEmail: nameMap[r.user_id] || 'Học viên ẩn danh',
    }
  })

  const ratingCount = reviews.length
  const ratingAvg = ratingCount > 0 ? Number((sum / ratingCount).toFixed(1)) : 0

  return {
    reviews,
    stats: {
      ratingAvg,
      ratingCount,
      distribution,
    },
  }
}

export async function getUserCourseReview(courseId: string): Promise<CourseReview | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    courseId: data.course_id,
    userId: data.user_id,
    rating: data.rating,
    comment: data.comment || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userEmail: user.email || 'Tôi',
  }
}

export async function addOrUpdateReview(
  courseId: string,
  rating: number,
  comment: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để gửi đánh giá' }
  }

  // 2. Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { ok: false, error: 'Chỉ học viên đã đăng ký khóa học mới có thể viết đánh giá' }
  }

  // 3. Validate rating and comment
  if (rating < 1 || rating > 5) {
    return { ok: false, error: 'Số sao đánh giá phải từ 1 đến 5' }
  }

  const trimmedComment = comment.trim()
  if (trimmedComment.length > 2000) {
    return { ok: false, error: 'Nội dung nhận xét không được vượt quá 2000 ký tự' }
  }

  // 4. Upsert review
  const { error: upsertError } = await supabase
    .from('course_reviews')
    .upsert(
      {
        course_id: courseId,
        user_id: user.id,
        rating,
        comment: trimmedComment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'course_id,user_id' }
    )

  if (upsertError) {
    console.error('Lỗi khi gửi đánh giá:', upsertError)
    return { ok: false, error: upsertError.message }
  }

  revalidatePath('/courses')
  revalidatePath(`/courses/${courseId}`)
  return { ok: true }
}

export async function deleteReview(
  courseId: string,
  reviewId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập' }
  }

  const { data: review } = await supabase
    .from('course_reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single()

  if (!review || review.user_id !== user.id) {
    return { ok: false, error: 'Bạn không có quyền xóa đánh giá này' }
  }

  const { error: deleteError } = await supabase
    .from('course_reviews')
    .delete()
    .eq('id', reviewId)

  if (deleteError) {
    console.error('Lỗi khi xóa đánh giá:', deleteError)
    return { ok: false, error: deleteError.message }
  }

  revalidatePath('/courses')
  revalidatePath(`/courses/${courseId}`)
  return { ok: true }
}
```

- [ ] **Step 2: Commit Task 4**

```bash
git add src/actions/reviews.ts
git commit -m "feat(actions): add server actions for fetching, posting, updating and deleting course reviews"
```

---

### Task 5: Update `<CourseCard />` Component with Rating Badge

**Files:**
- Modify: `src/components/CourseCard.tsx`

**Interfaces:**
- Consumes: `course.ratingAvg`, `course.ratingCount`
- Produces: Rendered rating badge (amber gold star, score, review count).

- [ ] **Step 1: Add rating badge UI to `CourseCard.tsx`**

In `CourseCard.tsx`, render rating badge in the meta section:

```tsx
{/* Rating Badge */}
<div className="flex items-center gap-1.5 text-xs font-semibold">
  <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
  {course.ratingCount && course.ratingCount > 0 ? (
    <span className="text-text-primary">
      {course.ratingAvg?.toFixed(1)}{' '}
      <span className="text-text-tertiary font-normal">({course.ratingCount})</span>
    </span>
  ) : (
    <span className="text-amber-500 font-medium">Mới</span>
  )}
</div>
```

- [ ] **Step 2: Commit Task 5**

```bash
git add src/components/CourseCard.tsx
git commit -m "feat(ui): add rating average score and review count badge to CourseCard"
```

---

### Task 6: Create `<CourseReviewsSection />` Component

**Files:**
- Create: `src/components/CourseReviewsSection.tsx`

**Interfaces:**
- Consumes: `courseId`, `isEnrolled`, `initialReviews`, `initialStats`, `userReview`
- Produces: Full interactive course reviews section (summary header, star picker form, review cards).

- [ ] **Step 1: Create `src/components/CourseReviewsSection.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { CourseReview, CourseRatingStats } from '@/types/review'
import { addOrUpdateReview, deleteReview } from '@/actions/reviews'

interface CourseReviewsSectionProps {
  courseId: string;
  isEnrolled: boolean;
  initialReviews: CourseReview[];
  initialStats: CourseRatingStats;
  initialUserReview: CourseReview | null;
}

export default function CourseReviewsSection({
  courseId,
  isEnrolled,
  initialReviews,
  initialStats,
  initialUserReview,
}: CourseReviewsSectionProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews)
  const [stats, setStats] = useState<CourseRatingStats>(initialStats)
  const [userReview, setUserReview] = useState<CourseReview | null>(initialUserReview)

  // Form states
  const [rating, setRating] = useState<number>(initialUserReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>(initialUserReview?.comment || '')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!isEnrolled) {
      setErrorMsg('Bạn cần đăng ký khóa học này để gửi nhận xét')
      return
    }

    startTransition(async () => {
      const res = await addOrUpdateReview(courseId, rating, comment)
      if (res.ok) {
        setSuccessMsg(userReview ? 'Đã cập nhật đánh giá thành công!' : 'Đã gửi đánh giá thành công!')
        setUserReview({
          id: userReview?.id || 'temp',
          courseId,
          userId: 'user',
          rating,
          comment,
          createdAt: userReview?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userEmail: 'Tôi',
        })
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi gửi đánh giá')
      }
    })
  }

  const handleDeleteReview = async () => {
    if (!userReview) return
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá của mình?')) return

    setErrorMsg('')
    setSuccessMsg('')

    startTransition(async () => {
      const res = await deleteReview(courseId, userReview.id)
      if (res.ok) {
        setUserReview(null)
        setRating(5)
        setComment('')
        setSuccessMsg('Đã xóa đánh giá thành công')
      } else {
        setErrorMsg(res.error || 'Không thể xóa đánh giá')
      }
    })
  }

  return (
    <div className="mt-12 pt-10 border-t border-border-subtle">
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2.5">
        <svg className="w-6 h-6 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Đánh giá từ học viên ({stats.ratingCount})
      </h2>

      {/* RATING SUMMARY HEADER */}
      <div className="glass-card p-6 sm:p-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center text-center md:border-r border-border-subtle md:pr-6">
          <span className="text-5xl font-extrabold gradient-text tracking-tight mb-2">
            {stats.ratingAvg > 0 ? stats.ratingAvg.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.ratingAvg)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-600 fill-gray-600'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-text-tertiary font-medium">
            Đánh giá trung bình từ {stats.ratingCount} học viên
          </span>
        </div>

        {/* DISTRIBUTION BARS */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((starKey) => {
            const count = stats.distribution[starKey as 1|2|3|4|5] || 0
            const percent = stats.ratingCount > 0 ? Math.round((count / stats.ratingCount) * 100) : 0
            return (
              <div key={starKey} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-semibold text-text-secondary">{starKey} sao</span>
                <div className="flex-grow h-2.5 bg-bg-card rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 text-right text-text-tertiary font-mono">{percent}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ENROLLED USER REVIEW FORM */}
      {isEnrolled ? (
        <div className="glass-card p-6 mb-8 border-purple-500/20">
          <h3 className="text-lg font-bold text-text-primary mb-3">
            {userReview ? 'Đánh giá của bạn' : 'Viết đánh giá cho khóa học'}
          </h3>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 text-xs bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRatingSubmit} className="space-y-4">
            {/* Interactive Star Picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-secondary mr-2">Chọn số sao:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = s <= (hoverRating || rating)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          active ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  )
                })}
              </div>
              <span className="text-xs font-bold text-amber-400 ml-2">{hoverRating || rating} / 5 sao</span>
            </div>

            {/* Comment Textarea */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm và suy nghĩ của bạn về khóa học này..."
                rows={3}
                maxLength={2000}
                className="w-full p-4 rounded-xl bg-bg-card text-text-primary placeholder:text-text-tertiary border border-border-subtle focus:outline-none focus:border-accent-violet transition-colors text-sm resize-none"
              />
              <div className="text-right text-[11px] text-text-tertiary mt-1">
                {comment.length} / 2000 ký tự
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-accent-violet to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? 'Đang gửi...' : userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>

              {userReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                >
                  Xóa đánh giá
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card p-5 mb-8 text-center border-amber-500/20 bg-amber-500/5">
          <p className="text-sm font-medium text-text-secondary">
            Bạn cần <strong className="text-white">đăng ký khóa học</strong> để viết đánh giá và nhận xét.
          </p>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="glass-card p-8 text-center text-text-tertiary text-sm">
            Chưa có đánh giá nào cho khóa học này. Hãy là người đầu tiên gửi nhận xét!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="glass-card p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {rev.userEmail.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{rev.userEmail}</h4>
                    <span className="text-[11px] text-text-tertiary">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold text-amber-400">{rev.rating} ★</span>
                </div>
              </div>

              {rev.comment && (
                <p className="text-sm text-text-secondary leading-relaxed pl-12">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit Task 6**

```bash
git add src/components/CourseReviewsSection.tsx
git commit -m "feat(ui): add CourseReviewsSection component for displaying rating stats, user review form, and review list"
```

---

### Task 7: Integrate `<CourseReviewsSection />` in Course Detail Page

**Files:**
- Modify: `src/app/courses/[id]/page.tsx`

**Interfaces:**
- Consumes: `getCourseReviews`, `getUserCourseReview` from `src/actions/reviews.ts`, `CourseReviewsSection` component.
- Produces: Integrated reviews section on `/courses/[id]` page.

- [ ] **Step 1: Modify `src/app/courses/[id]/page.tsx`**

Import review actions and component, fetch review data, and render section below lesson list:

```tsx
import CourseReviewsSection from '@/components/CourseReviewsSection'
import { getCourseReviews, getUserCourseReview } from '@/actions/reviews'

// Inside CourseDetailPage function:
const { reviews, stats } = await getCourseReviews(course.id)
const userReview = await getUserCourseReview(course.id)

// In JSX below lessons list container:
<CourseReviewsSection
  courseId={course.id}
  isEnrolled={isEnrolled}
  initialReviews={reviews}
  initialStats={stats}
  initialUserReview={userReview}
/>
```

- [ ] **Step 2: Commit Task 7**

```bash
git add src/app/courses/[id]/page.tsx
git commit -m "feat(page): embed CourseReviewsSection into course detail page"
```
