# User Profile & Avatar Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement user profile management and avatar image upload feature using Supabase Storage and RLS policies.

**Architecture:** Create `profiles` database table and `avatars` public storage bucket in Supabase with automatic user signup triggers and strict user-scoped RLS policies. Expose Server Actions for fetching profile data, updating full name, and uploading avatar files to Supabase Storage. Render an interactive `/profile` form with client image preview and sidebar navigation link.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase (Storage, Auth, RLS, Triggers), Tailwind CSS.

## Global Constraints
- Avatar upload file size limit: 2MB max.
- Allowed avatar formats: PNG, JPG, JPEG, WEBP, GIF.
- Storage RLS policies restrict file mutations to `{user_id}` directory.
- `Sidebar.tsx` includes link to `/profile`.

---

### Task 1: Database Migration & Storage Setup SQL

**Files:**
- Create: `supabase_migration_profiles.sql`

**Interfaces:**
- Consumes: `auth.users`, `storage.buckets`, `storage.objects`
- Produces: `profiles` table, `handle_new_user` trigger, `avatars` bucket and RLS policies.

- [ ] **Step 1: Create `supabase_migration_profiles.sql`**

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

- [ ] **Step 2: Commit Task 1**

```bash
git add supabase_migration_profiles.sql
git commit -m "feat(db): add profiles table and avatars storage bucket migration with RLS policies"
```

---

### Task 2: Data Models & Types

**Files:**
- Create: `src/types/profile.ts`

**Interfaces:**
- Consumes: None
- Produces: `UserProfile` interface.

- [ ] **Step 1: Create `src/types/profile.ts`**

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

- [ ] **Step 2: Commit Task 2**

```bash
git add src/types/profile.ts
git commit -m "feat(types): define UserProfile interface"
```

---

### Task 3: Server Actions for Profile & Avatar

**Files:**
- Create: `src/actions/profile.ts`

**Interfaces:**
- Consumes: Supabase server client (`@/lib/supabase/server`), `profiles` table, `avatars` storage bucket.
- Produces: `getProfile`, `updateProfile`, `uploadAvatarAction` server actions.

- [ ] **Step 1: Create `src/actions/profile.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/types/profile'

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) {
    // Fallback: auto-insert if profile row doesn't exist yet
    const fallbackName = user.email ? user.email.split('@')[0] : 'Học viên'
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: fallbackName,
    })

    return {
      id: user.id,
      email: user.email || '',
      fullName: fallbackName,
      avatarUrl: null,
    }
  }

  return {
    id: data.id,
    email: data.email || user.email || '',
    fullName: data.full_name || '',
    avatarUrl: data.avatar_url || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateProfile(
  fullName: string,
  avatarUrl?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập' }
  }

  const trimmedName = fullName.trim()
  if (!trimmedName) {
    return { ok: false, error: 'Họ và tên không được để trống' }
  }

  const updatePayload: Record<string, any> = {
    full_name: trimmedName,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl !== undefined) {
    updatePayload.avatar_url = avatarUrl
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (updateError) {
    console.error('Lỗi khi cập nhật hồ sơ:', updateError)
    return { ok: false, error: updateError.message }
  }

  revalidatePath('/profile')
  revalidatePath('/courses')
  return { ok: true }
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ ok: boolean; publicUrl?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để upload ảnh' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { ok: false, error: 'Không tìm thấy file ảnh' }
  }

  // Validate size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: 'Kích thước ảnh tối đa là 2MB' }
  }

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: 'Định dạng ảnh không hỗ trợ (chỉ nhận PNG, JPG, WEBP, GIF)' }
  }

  const fileExt = file.name.split('.').pop() || 'png'
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('Lỗi khi upload avatar lên Supabase Storage:', uploadError)
    return { ok: false, error: uploadError.message }
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { ok: true, publicUrl: urlData.publicUrl }
}
```

- [ ] **Step 2: Commit Task 3**

```bash
git add src/actions/profile.ts
git commit -m "feat(actions): add server actions for profile fetching, updating, and avatar upload"
```

---

### Task 4: Create Profile Form Component

**Files:**
- Create: `src/components/ProfileForm.tsx`

**Interfaces:**
- Consumes: `initialProfile` of type `UserProfile`
- Produces: Interactive profile form with avatar file picker, client preview, and save handler.

- [ ] **Step 1: Create `src/components/ProfileForm.tsx`**

```tsx
'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { UserProfile } from '@/types/profile'
import { updateProfile, uploadAvatarAction } from '@/actions/profile'

interface ProfileFormProps {
  initialProfile: UserProfile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState<string>(initialProfile.fullName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh tối đa là 2MB')
      return
    }

    setErrorMsg('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    startTransition(async () => {
      let finalAvatarUrl = avatarUrl

      // 1. Upload avatar if new file selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const uploadRes = await uploadAvatarAction(formData)

        if (!uploadRes.ok || !uploadRes.publicUrl) {
          setErrorMsg(uploadRes.error || 'Tải ảnh đại diện thất bại')
          return
        }
        finalAvatarUrl = uploadRes.publicUrl
        setAvatarUrl(finalAvatarUrl)
        setPreviewUrl(null)
        setSelectedFile(null)
      }

      // 2. Update profile name and avatar_url
      const updateRes = await updateProfile(fullName, finalAvatarUrl)
      if (updateRes.ok) {
        setSuccessMsg('Đã cập nhật thông tin hồ sơ thành công!')
      } else {
        setErrorMsg(updateRes.error || 'Cập nhật thất bại')
      }
    })
  }

  const currentDisplayAvatar = previewUrl || avatarUrl

  return (
    <div className="glass-card p-6 sm:p-10 max-w-2xl mx-auto rounded-2xl animate-fade-in border-border-subtle">
      <h2 className="text-2xl font-bold text-text-primary mb-6 tracking-tight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        Thông tin cá nhân
      </h2>

      {errorMsg && (
        <div className="p-4 mb-6 text-xs bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 animate-slide-up">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 text-xs bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 animate-slide-up">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AVATAR UPLOADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border-subtle">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden relative ring-4 ring-purple-500/20 glass-card flex items-center justify-center bg-gradient-to-tr from-accent-violet to-accent-cyan text-white text-3xl font-extrabold shadow-xl">
              {currentDisplayAvatar ? (
                <Image
                  src={currentDisplayAvatar}
                  alt={fullName || 'Avatar'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                (fullName || initialProfile.email).slice(0, 2).toUpperCase()
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-violet text-white flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-text-primary">Ảnh đại diện</h3>
            <p className="text-xs text-text-tertiary">
              Định dạng PNG, JPG, WEBP hoặc GIF. Dung lượng tối đa 2MB.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-bg-card hover:bg-bg-card-hover text-text-secondary text-xs font-semibold rounded-xl border border-border-subtle transition-all"
            >
              Chọn ảnh từ máy tính
            </button>
          </div>
        </div>

        {/* INPUT FIELDS */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-card text-text-primary border border-border-subtle focus:outline-none focus:border-accent-violet transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Địa chỉ Email (Không thể thay đổi)
            </label>
            <input
              type="email"
              value={initialProfile.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-bg-card/50 text-text-tertiary border border-border-subtle text-sm cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-gradient-to-r from-accent-violet to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isPending ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit Task 4**

```bash
git add src/components/ProfileForm.tsx
git commit -m "feat(ui): add ProfileForm component with avatar upload preview and user details input"
```

---

### Task 5: Create Profile Route Page

**Files:**
- Create: `src/app/profile/page.tsx`

**Interfaces:**
- Consumes: `getProfile` from `src/actions/profile.ts`, `ProfileForm` component.
- Produces: User Profile page route (`/profile`).

- [ ] **Step 1: Create `src/app/profile/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
import ProfileForm from '@/components/ProfileForm'

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân | LishTex',
  description: 'Quản lý thông tin cá nhân và ảnh đại diện',
}

export default async function ProfilePage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <ProfileForm initialProfile={profile} />
    </div>
  )
}
```

- [ ] **Step 2: Commit Task 5**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(page): create /profile page route with authentication check"
```

---

### Task 6: Add Sidebar Link for Profile

**Files:**
- Modify: `src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: `navItems` array
- Produces: Navigation item linking to `/profile`.

- [ ] **Step 1: Modify `src/components/Sidebar.tsx`**

Add `Hồ sơ cá nhân` to `navItems` array in `Sidebar.tsx`:

```tsx
  {
    label: 'Hồ sơ cá nhân',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
```

- [ ] **Step 2: Commit Task 6**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat(ui): add Profile link to Sidebar navigation menu"
```
