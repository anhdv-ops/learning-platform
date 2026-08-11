# Production Readiness & Security Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perform complete security audit (master RLS migration for all 8 database tables & 2 storage buckets), enhance OpenGraph & Twitter Card SEO metadata across Next.js pages, and configure environment variables template for Vercel deployment.

**Architecture:** Create `supabase_migration_production_rls.sql` to enforce security policies and enable RLS across all tables. Update `layout.tsx`, `courses/[id]/page.tsx`, `courses/page.tsx`, `my-courses/page.tsx`, and `profile/page.tsx` with complete SEO metadata and OpenGraph social sharing image configurations. Create `.env.example`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase (RLS, PostgreSQL, Storage), Open Graph Protocol, Vercel.

## Global Constraints
- Enforce RLS on all 8 tables: `courses`, `lessons`, `enrollments`, `user_progress`, `comments`, `course_reviews`, `profiles`, `lesson_materials`.
- Enforce RLS on Storage buckets: `avatars`, `lesson-materials`.
- Include `og:image` and `twitter:card` metadata for all course pages.
- No TypeScript or build errors.

---

### Task 1: Master Production RLS Security Migration SQL

**Files:**
- Create: `supabase_migration_production_rls.sql`

**Interfaces:**
- Consumes: All 8 database tables and 2 storage buckets.
- Produces: Master production RLS policies and security definitions.

- [ ] **Step 1: Create `supabase_migration_production_rls.sql`**

```sql
-- ============================================
-- Master Migration: Production Security & RLS Audit
-- Applies RLS and Policies for ALL Tables and Storage Buckets
-- ============================================

-- 1. COURSES TABLE
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public courses read access" ON courses;
CREATE POLICY "Public courses read access" ON courses FOR SELECT USING (true);

-- 2. LESSONS TABLE
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public lessons read access" ON lessons;
CREATE POLICY "Public lessons read access" ON lessons FOR SELECT USING (true);

-- 3. ENROLLMENTS TABLE
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollment" ON enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollment" ON enrollments;

CREATE POLICY "Users can read own enrollments" ON enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollment" ON enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollment" ON enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. USER_PROGRESS TABLE
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. COMMENTS TABLE
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public comments read access" ON comments;
DROP POLICY IF EXISTS "Users can insert own comment" ON comments;
DROP POLICY IF EXISTS "Users can delete own comment" ON comments;

CREATE POLICY "Public comments read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comment" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. COURSE_REVIEWS TABLE
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reviews read access" ON course_reviews;
DROP POLICY IF EXISTS "Users can insert own review" ON course_reviews;
DROP POLICY IF EXISTS "Users can update own review" ON course_reviews;
DROP POLICY IF EXISTS "Users can delete own review" ON course_reviews;

CREATE POLICY "Public reviews read access" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own review" ON course_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review" ON course_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own review" ON course_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read access" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 8. LESSON_MATERIALS TABLE
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated materials read access" ON lesson_materials;
DROP POLICY IF EXISTS "Users can insert own material" ON lesson_materials;
DROP POLICY IF EXISTS "Users can delete own material" ON lesson_materials;

CREATE POLICY "Authenticated materials read access" ON lesson_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own material" ON lesson_materials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own material" ON lesson_materials FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9. STORAGE BUCKETS POLICIES (avatars & lesson-materials)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-materials', 'lesson-materials', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public avatar bucket read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;

CREATE POLICY "Public avatar bucket read access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users upload avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public lesson-materials read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload lesson-materials" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own lesson-materials" ON storage.objects;

CREATE POLICY "Public lesson-materials read access" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-materials');
CREATE POLICY "Authenticated users upload lesson-materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-materials');
CREATE POLICY "Users delete own lesson-materials" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lesson-materials' AND (owner = auth.uid() OR owner IS NULL));
```

- [ ] **Step 2: Commit Task 1**

```bash
git add supabase_migration_production_rls.sql
git commit -m "feat(db): add master production RLS security audit migration for all tables and storage buckets"
```

---

### Task 2: Global SEO & OpenGraph Metadata Setup (`src/app/layout.tsx`)

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Next.js `Metadata` type
- Produces: Enhanced root layout metadata with `metadataBase`, `openGraph`, `twitter`, `robots`.

- [ ] **Step 1: Modify `src/app/layout.tsx`**

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    template: '%s | LishTex',
  },
  description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex. Luyện nghe, nói, đọc, viết với các bài học tương tác, tài liệu học tập và hệ thống đánh giá khóa học chuyên nghiệp.',
  keywords: ['học tiếng anh', 'english learning', 'lishtex', 'khóa học tiếng anh', 'online courses', 'tiếng anh tương tác'],
  authors: [{ name: 'LishTex Team' }],
  creator: 'LishTex',
  publisher: 'LishTex',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'LishTex',
    title: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex. Luyện nghe, nói, đọc, viết với các bài học tương tác và tài liệu chất lượng.',
    images: [
      {
        url: '/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'LishTex Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex.',
    images: ['/og-banner.png'],
  },
}
```

- [ ] **Step 2: Commit Task 2**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): configure global OpenGraph, Twitter card, and robots metadata in RootLayout"
```

---

### Task 3: Dynamic OpenGraph Course Metadata (`src/app/courses/[id]/page.tsx`)

**Files:**
- Modify: `src/app/courses/[id]/page.tsx`

**Interfaces:**
- Consumes: `getCourseById`
- Produces: Dynamic metadata with course-specific thumbnail for `og:image` and `twitter:image`.

- [ ] **Step 1: Modify `generateMetadata` in `src/app/courses/[id]/page.tsx`**

```tsx
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const course = await getCourseById(params.id)

  if (!course) {
    return {
      title: 'Khóa học không tồn tại',
    }
  }

  const courseTitle = `${course.title} | LishTex`
  const courseDescription = course.description || 'Khóa học tiếng Anh chất lượng cao tại LishTex.'
  const courseImage = course.thumbnail || '/og-banner.png'

  return {
    title: courseTitle,
    description: courseDescription,
    openGraph: {
      title: courseTitle,
      description: courseDescription,
      url: `/courses/${course.id}`,
      siteName: 'LishTex',
      type: 'article',
      locale: 'vi_VN',
      images: [
        {
          url: courseImage,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: courseTitle,
      description: courseDescription,
      images: [courseImage],
    },
  }
}
```

- [ ] **Step 2: Commit Task 3**

```bash
git add src/app/courses/[id]/page.tsx
git commit -m "feat(seo): add dynamic OpenGraph and Twitter card metadata with course thumbnails"
```

---

### Task 4: Add Metadata for App Pages (`/courses`, `/my-courses`)

**Files:**
- Modify: `src/app/courses/page.tsx`
- Modify: `src/app/my-courses/page.tsx`

**Interfaces:**
- Consumes: Next.js `Metadata` type
- Produces: Exported metadata for catalog and my-courses pages.

- [ ] **Step 1: Modify `src/app/courses/page.tsx` and `src/app/my-courses/page.tsx`**

Add exported metadata to both pages.

- [ ] **Step 2: Commit Task 4**

```bash
git add src/app/courses/page.tsx src/app/my-courses/page.tsx
git commit -m "feat(seo): add page-specific metadata for courses catalog and my-courses pages"
```

---

### Task 5: Environment Template (`.env.example`)

**Files:**
- Create: `.env.example`

**Interfaces:**
- Consumes: Project environment variables
- Produces: Sample `.env.example` file for Vercel deployment.

- [ ] **Step 1: Create `.env.example`**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Production Domain Site URL (used for metadata base & password resets)
NEXT_PUBLIC_SITE_URL=https://lishtex.vercel.app
```

- [ ] **Step 2: Commit Task 5**

```bash
git add .env.example
git commit -m "chore(config): create .env.example template for Vercel deployment"
```
