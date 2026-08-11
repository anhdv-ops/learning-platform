# User Profile & Avatar Upload System Design Document

**Date:** 2026-08-11
**Feature:** User Profile & Avatar Upload (Trang Hồ sơ cá nhân & Supabase Storage)
**Status:** Approved by User

---

## 1. Overview & Goals

The User Profile & Avatar Upload feature enables authenticated students to view and edit their personal profile details (Full Name) and upload an avatar image stored securely in Supabase Storage (`avatars` bucket). The updated avatar and full name are persisted in the `profiles` database table and reflected across user interaction areas (e.g. comments, course reviews, navigation sidebar).

Key user-facing features:
- Dedicated `/profile` route accessible from the primary `Sidebar` navigation.
- Avatar image uploader with instant client-side preview, file validation (max 2MB, formats: PNG, JPG, WEBP), and upload to Supabase Storage.
- Profile editing form to update `full_name`.
- Read-only display of user's registered email address.
- Automatic creation of profile database records upon user signup, with fallback auto-creation if a legacy account logs in.

---

## 2. Database & Supabase Storage Schema

### Migration SQL (`supabase_migration_profiles.sql`)

```sql
-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by user id
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 2. Row Level Security (RLS) for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read access" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Public profiles read access"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Automatic Trigger to create profile record when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Supabase Storage Bucket setup for 'avatars'
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'avatars' bucket
DROP POLICY IF EXISTS "Public avatar bucket read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;

CREATE POLICY "Public avatar bucket read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users upload avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 3. Data Models & TypeScript Types

### `@/types/profile.ts`

```typescript
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 4. API & Server Actions (`src/actions/profile.ts`)

- `getProfile()`:
  - Fetches profile record for currently authenticated user.
  - If missing, auto-creates default profile using `auth.users` details.
  - Returns `UserProfile` object.
- `updateProfile(formData: FormData)`:
  - Validates user authentication.
  - Extract `fullName` and `avatarUrl`.
  - Updates `profiles` table for current user.
  - Calls `revalidatePath('/profile')` and revalidates relevant pages.
- `uploadAvatarAction(formData: FormData)`:
  - Extracts file from FormData.
  - Validates MIME type (`image/png`, `image/jpeg`, `image/webp`, `image/gif`) and max file size (2MB).
  - Generates file path `avatars/${userId}/avatar-${Date.now()}.${ext}`.
  - Uploads to Supabase Storage bucket `avatars`.
  - Gets public URL via `supabase.storage.from('avatars').getPublicUrl(filePath)`.
  - Returns `{ ok: true, publicUrl: string }` or `{ ok: false, error: string }`.

---

## 5. UI Components & Layout Integration

### A. `<ProfileForm />` (`src/components/ProfileForm.tsx`)
- Client component rendered on `/profile`.
- **Avatar Preview & Picker:**
  - Round avatar image (128x128px) with gradient ring border and camera badge icon.
  - Hidden file input triggered by clicking avatar frame or "Thay đổi ảnh" button.
  - Instant image preview URL using `URL.createObjectURL(file)`.
- **Form Controls:**
  - Full Name input field.
  - Email address input field (disabled / read-only).
  - Submit button with spinner loading state ("Đang lưu...").
  - Alert banners for success and error messages.

### B. Route Page (`src/app/profile/page.tsx`)
- Server component wrapped in authentication check (redirects to `/auth/login` if unauthenticated).
- Calls `getProfile()` and passes initial data to `<ProfileForm />`.

### C. Sidebar Navigation (`src/components/Sidebar.tsx`)
- Add new item in `navItems` array:
  - Label: `Hồ sơ cá nhân`
  - Href: `/profile`
  - Icon: User profile SVG icon.

---

## 6. Verification Plan

1. **Database & Storage Verification:**
   - Execute `supabase_migration_profiles.sql` on Supabase dashboard.
   - Verify `profiles` table and `avatars` storage bucket creation.
2. **Functional Verification:**
   - Log in as student, navigate to `/profile` via Sidebar.
   - Select avatar image file (> 2MB) -> Verify size validation error banner.
   - Select valid image file -> Verify instant client preview.
   - Click "Lưu thay đổi" -> Verify upload to Supabase Storage `avatars` bucket and database update.
   - Refresh page -> Verify updated Full Name and Avatar persist cleanly.
   - Run `npx tsc --noEmit` and `npm run build` to ensure type safety and clean build.
