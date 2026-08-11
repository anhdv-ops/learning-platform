# Production Readiness, Security Audit & SEO Optimization Design Document

**Date:** 2026-08-11
**Feature:** Production Readiness & Security Audit (Bảo mật RLS Supabase, SEO OpenGraph Metadata, Vercel Config)
**Status:** Approved by User (Direct Execution)

---

## 1. Overview & Goals

This Production Readiness initiative prepares the Learning Platform application for secure, high-performance, SEO-friendly deployment on Vercel and Supabase.

Key Objectives:
- **Supabase Security & RLS Consolidation**: Audit and enforce Row Level Security (RLS) policies across all 8 database tables (`courses`, `lessons`, `enrollments`, `user_progress`, `comments`, `course_reviews`, `profiles`, `lesson_materials`) and 2 storage buckets (`avatars`, `lesson-materials`).
- **SEO & Social Sharing Metadata**: Enhance global metadata (`layout.tsx`) and dynamic metadata (`courses/[id]/page.tsx`, catalog, my-courses, profile) with Open Graph (`og:image`, `og:title`, `og:description`, `og:url`), Twitter Cards (`summary_large_image`), canonical URLs, and search engine directives (`robots`).
- **Environment & Vercel Sync**: Create `.env.example` file and deployment checklist for Vercel production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).

---

## 2. Database & RLS Security Specification

### Master Production RLS Migration (`supabase_migration_production_rls.sql`)

1. **`courses` Table**:
   - RLS: Enabled
   - SELECT: Public access (`USING (true)`)
   - INSERT/UPDATE/DELETE: Restricted to service_role / admins.

2. **`lessons` Table**:
   - RLS: Enabled
   - SELECT: Public access (`USING (true)`)
   - INSERT/UPDATE/DELETE: Restricted to service_role / admins.

3. **`enrollments` Table**:
   - RLS: Enabled
   - SELECT: Authenticated user can read own enrollments (`auth.uid() = user_id`)
   - INSERT: Authenticated user can insert own enrollment (`auth.uid() = user_id`)
   - DELETE: Authenticated user can delete own enrollment (`auth.uid() = user_id`)

4. **`user_progress` Table**:
   - RLS: Enabled
   - SELECT: Authenticated user can read own progress (`auth.uid() = user_id`)
   - INSERT: Authenticated user can insert own progress (`auth.uid() = user_id`)
   - UPDATE: Authenticated user can update own progress (`auth.uid() = user_id`)

5. **`comments` Table**:
   - RLS: Enabled
   - SELECT: Public read access
   - INSERT: Authenticated user can post own comment (`auth.uid() = user_id`)
   - DELETE: Authenticated user can delete own comment (`auth.uid() = user_id`)

6. **`course_reviews` Table**:
   - RLS: Enabled
   - SELECT: Public read access
   - INSERT: Authenticated user can insert own review (`auth.uid() = user_id`)
   - UPDATE: Authenticated user can update own review (`auth.uid() = user_id`)
   - DELETE: Authenticated user can delete own review (`auth.uid() = user_id`)

7. **`profiles` Table**:
   - RLS: Enabled
   - SELECT: Public read access
   - INSERT: Authenticated user can insert own profile (`auth.uid() = id`)
   - UPDATE: Authenticated user can update own profile (`auth.uid() = id`)

8. **`lesson_materials` Table**:
   - RLS: Enabled
   - SELECT: Authenticated user read access
   - INSERT: Authenticated user can insert own material (`auth.uid() = user_id`)
   - DELETE: Authenticated user can delete own material (`auth.uid() = user_id`)

9. **Storage Buckets (`avatars`, `lesson-materials`)**:
   - RLS on `storage.objects`: Public read access, authenticated user upload/update/delete scoped to user identity.

---

## 3. SEO & Open Graph Metadata Architecture

### Global Layout (`src/app/layout.tsx`)
- Set `metadataBase`: `new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')`
- Set `title`: `{ default: 'LishTex — Nền tảng học tiếng Anh trực tuyến', template: '%s | LishTex' }`
- Set `description`: Detailed Vietnamese description.
- Set `openGraph`: siteName, locale (`vi_VN`), type (`website`), default title, description, and preview image (`/og-banner.png` or thumbnail).
- Set `twitter`: `card: 'summary_large_image'`, title, description.
- Set `robots`: `index: true, follow: true`.

### Course Detail Page (`src/app/courses/[id]/page.tsx`)
- Dynamic `generateMetadata`:
  - `title`: `${course.title} | LishTex`
  - `description`: `${course.description}`
  - `openGraph`:
    - `title`: `${course.title} | LishTex`
    - `description`: `${course.description}`
    - `images`: `[{ url: course.thumbnail, width: 1200, height: 630, alt: course.title }]`
  - `twitter`:
    - `card`: `summary_large_image`
    - `title`: `${course.title}`
    - `description`: `${course.description}`
    - `images`: `[course.thumbnail]`

### Catalog & User Pages
- `src/app/courses/page.tsx`: Metadata for course catalog page.
- `src/app/my-courses/page.tsx`: Metadata for enrolled courses page.
- `src/app/profile/page.tsx`: Metadata for user profile page.

---

## 4. Environment Variables Setup (`.env.example`)

Create `.env.example` in workspace root containing:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://lishtex.vercel.app
```

---

## 5. Verification Plan

1. **TypeScript & Build Verification**:
   - Run `npx tsc --noEmit` -> Must pass with 0 errors.
   - Run `npm run build` -> Next.js production build must compile and generate static pages without issues.
2. **Commit & Push**:
   - Commit all changes and push to GitHub repository (`origin/main`).
