'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { LessonMaterial } from '@/types/material'

export async function getLessonMaterials(lessonId: string): Promise<LessonMaterial[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lesson_materials')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Lỗi khi lấy danh sách tài liệu:', error)
    return []
  }

  return data.map((m: any) => ({
    id: m.id,
    lessonId: m.lesson_id,
    userId: m.user_id,
    title: m.title,
    description: m.description || '',
    fileUrl: m.file_url,
    fileType: m.file_type || 'other',
    fileSize: m.file_size || 0,
    createdAt: m.created_at,
  }))
}

export interface AddMaterialInput {
  lessonId: string
  courseId: string
  title: string
  description: string
  fileUrl: string
  fileType: 'pdf' | 'video' | 'document' | 'other'
  fileSize: number
}

export async function addLessonMaterial(
  input: AddMaterialInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để tải lên tài liệu' }
  }

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle) {
    return { ok: false, error: 'Tên tài liệu không được để trống' }
  }

  const { error: insertError } = await supabase
    .from('lesson_materials')
    .insert({
      lesson_id: input.lessonId,
      user_id: user.id,
      title: trimmedTitle,
      description: input.description.trim(),
      file_url: input.fileUrl,
      file_type: input.fileType,
      file_size: input.fileSize,
    })

  if (insertError) {
    console.error('Lỗi khi thêm tài liệu:', insertError)
    return { ok: false, error: insertError.message }
  }

  revalidatePath(`/courses/${input.courseId}/lessons/${input.lessonId}`)
  return { ok: true }
}

export async function deleteLessonMaterial(
  materialId: string,
  courseId: string,
  lessonId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập' }
  }

  // Kiểm tra xem user có phải người tạo file không
  const { data: material, error: fetchError } = await supabase
    .from('lesson_materials')
    .select('user_id')
    .eq('id', materialId)
    .single()

  if (fetchError || !material) {
    return { ok: false, error: 'Không tìm thấy tài liệu' }
  }

  if (material.user_id !== user.id) {
    return { ok: false, error: 'Chỉ người upload mới có quyền xoá tài liệu này!' }
  }

  const { error: deleteError } = await supabase
    .from('lesson_materials')
    .delete()
    .eq('id', materialId)
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Lỗi khi xoá tài liệu:', deleteError)
    return { ok: false, error: deleteError.message }
  }

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  return { ok: true }
}
