'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function enrollCourseAction(courseId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Unauthenticated' }
  }

  const { error: insertError } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      course_id: courseId,
    })

  if (insertError) {
    console.error('Lỗi khi đăng ký khóa học:', insertError)
    return { ok: false, error: insertError.message }
  }

  revalidatePath(`/courses/${courseId}`)
  return { ok: true }
}

export async function checkIsEnrolled(courseId: string, userId?: string): Promise<boolean> {
  const supabase = await createClient()

  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (error || !data) {
    return false
  }

  return true
}
