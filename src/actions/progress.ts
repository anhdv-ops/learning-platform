'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markLessonCompleted(courseId: string, lessonId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Bạn cần đăng nhập để lưu tiến độ học tập' }
  }

  // Kiểm tra xem bài học đã được đánh dấu trong user_progress chưa
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id, is_completed')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (existing) {
    // Đã có -> Đổi trạng thái (toggle)
    const nextStatus = !existing.is_completed
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({ is_completed: nextStatus, completed_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Lỗi khi cập nhật tiến độ:', updateError)
      return { ok: false, error: updateError.message }
    }
  } else {
    // Chưa có -> Tạo mới tiến độ
    const { error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        is_completed: true,
      })

    if (insertError) {
      console.error('Lỗi khi lưu tiến độ:', insertError)
      return { ok: false, error: insertError.message }
    }
  }

  revalidatePath('/courses', 'layout')
  return { ok: true }
}
