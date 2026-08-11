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
CREATE POLICY "Users can update own review" ON course_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
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
