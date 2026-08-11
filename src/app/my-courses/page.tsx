import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyCourses } from '@/lib/api'
import MyCoursesClient from '@/components/MyCoursesClient'

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const courses = await getMyCourses()

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <MyCoursesClient initialCourses={courses} />
      </div>
    </div>
  )
}
