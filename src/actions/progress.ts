'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function markLessonCompleted(courseId: string, lessonId: string) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const cookieStore = await cookies()
  cookieStore.set(`completed_${courseId}_${lessonId}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  revalidatePath('/courses', 'layout')

  return { ok: true }
}
