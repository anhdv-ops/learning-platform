'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function markLessonCompleted(courseId: string, lessonId: string) {
  // Giả lập server xử lý mất 1 giây
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Lưu trạng thái hoàn thành vào cookie để mock Database
  const cookieStore = await cookies()
  cookieStore.set(`completed_${courseId}_${lessonId}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 ngày
  })

  // Gọi revalidatePath với type 'layout' ở gốc /courses để Next.js 
  // xóa TẤT CẢ cache (cả Server Cache và Client Router Cache) của 
  // mọi trang nằm bên trong thư mục courses (bao gồm trang danh sách, chi tiết và bài học).
  revalidatePath('/courses', 'layout')

  return { ok: true }
}
