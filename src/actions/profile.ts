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
