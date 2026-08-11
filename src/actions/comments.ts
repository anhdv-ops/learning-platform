'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Comment } from '@/types/comment'

export async function getComments(lessonId: string): Promise<Comment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Lỗi khi lấy bình luận:', error)
    return []
  }

  // Lấy danh sách user_id duy nhất
  const userIds = [...new Set(data.map((c: any) => c.user_id))]

  // Lấy email cho từng user từ auth (qua admin hoặc profile nếu có)
  // Vì không thể truy vấn auth.users trực tiếp từ client, 
  // ta sẽ dùng thông tin user hiện tại và cache email từ comment metadata
  const emailMap: Record<string, string> = {}

  // Thử lấy từ bảng profiles nếu có, fallback sang user_id
  for (const uid of userIds) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', uid)
        .maybeSingle()

      if (profileData?.email) {
        emailMap[uid] = profileData.full_name || profileData.email
      } else {
        // Fallback: hiển thị tên ẩn danh với 4 ký tự cuối user_id
        emailMap[uid] = `Học viên ...${uid.slice(-4)}`
      }
    } catch {
      emailMap[uid] = `Học viên ...${uid.slice(-4)}`
    }
  }

  // Map và tổ chức theo cấu trúc reply
  const allComments: Comment[] = data.map((c: any) => ({
    id: c.id,
    lessonId: c.lesson_id,
    userId: c.user_id,
    parentId: c.parent_id,
    content: c.content,
    createdAt: c.created_at,
    userEmail: emailMap[c.user_id] || 'Ẩn danh',
  }))

  // Tách root comments và replies
  const rootComments = allComments.filter(c => !c.parentId)
  const replies = allComments.filter(c => c.parentId)

  // Gắn replies vào parent
  rootComments.forEach(root => {
    root.replies = replies
      .filter(r => r.parentId === root.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })

  return rootComments
}

export async function addComment(
  lessonId: string,
  courseId: string,
  content: string,
  parentId?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  // Xác thực user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để bình luận' }
  }

  // Kiểm tra đã đăng ký khóa học chưa
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { ok: false, error: 'Bạn cần đăng ký khóa học để bình luận' }
  }

  // Validate content
  const trimmed = content.trim()
  if (!trimmed) {
    return { ok: false, error: 'Nội dung bình luận không được để trống' }
  }

  if (trimmed.length > 2000) {
    return { ok: false, error: 'Bình luận không được vượt quá 2000 ký tự' }
  }

  // Insert comment
  const { error: insertError } = await supabase
    .from('comments')
    .insert({
      lesson_id: lessonId,
      user_id: user.id,
      parent_id: parentId || null,
      content: trimmed,
    })

  if (insertError) {
    console.error('Lỗi khi thêm bình luận:', insertError)
    return { ok: false, error: insertError.message }
  }

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  return { ok: true }
}

export async function deleteComment(
  commentId: string,
  courseId: string,
  lessonId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập' }
  }

  // Chỉ cho phép xoá comment của chính mình
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== user.id) {
    return { ok: false, error: 'Bạn không có quyền xoá bình luận này' }
  }

  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    console.error('Lỗi khi xoá bình luận:', deleteError)
    return { ok: false, error: deleteError.message }
  }

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  return { ok: true }
}
