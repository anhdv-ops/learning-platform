import { Course, Lesson } from '@/types/course'
import { createClient } from '@/lib/supabase/server'

export interface GetCoursesResponse {
  courses: Course[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getCourses(
  page: number,
  q?: string,
  level?: string
): Promise<GetCoursesResponse> {
  const PAGE_SIZE = 9
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE - 1

  const supabase = await createClient()

  // 1. Lấy thông tin user hiện tại (nếu đã đăng nhập)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    user = null
  }

  // 2. Lấy danh sách khóa học
  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })

  if (q && q.trim()) {
    const cleanQ = q.trim()
    query = query.or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`)
  }

  if (level && level.trim()) {
    query = query.eq('level', level.trim())
  }

  const { data, count, error } = await query
    .range(startIndex, endIndex)
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.error('Error fetching courses from Supabase:', error)
    return {
      courses: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    }
  }

  // 3. Nếu user đã đăng nhập, lấy danh sách khóa học user đã đăng ký và các bài học đã hoàn thành
  let userProgressMap: Record<string, number> = {}
  const enrolledCourseIds = new Set<string>()

  if (user) {
    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id)

    if (enrollData) {
      enrollData.forEach((e: { course_id: string }) => enrolledCourseIds.add(e.course_id))
    }

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('is_completed', true)

    if (progressData) {
      progressData.forEach((item: { course_id: string }) => {
        userProgressMap[item.course_id] = (userProgressMap[item.course_id] || 0) + 1
      })
    }
  }

  // 4. Map dữ liệu khóa học kèm tiến độ thực tế của user (chỉ tính nếu đã đăng ký)
  const courses: Course[] = data.map((c: any) => {
    const isEnrolled = enrolledCourseIds.has(c.id)
    const totalLessons = c.total_lessons || c.totalLessons || 0
    const completedLessons = isEnrolled ? (userProgressMap[c.id] || 0) : 0
    const progress = isEnrolled && totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0
    const status = progress === 100 ? 'completed' : 'in-progress'

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      level: c.level,
      kindOfCourse: c.kind_of_course || c.kindOfCourse,
      totalLessons,
      progress,
      status,
      ratingAvg: Number(c.rating_avg) || 0,
      ratingCount: Number(c.rating_count) || 0,
      lessons: [],
    }
  })

  const total = count || 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    courses,
    total,
    totalPages,
    currentPage: page,
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = await createClient()

  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (courseError || !courseData) {
    return null
  }

  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', id)
    .order('order', { ascending: true })

  // Lấy thông tin user & đăng ký
  const { data: { user } } = await supabase.auth.getUser()
  const completedLessonIds = new Set<string>()
  let isEnrolled = false

  if (user) {
    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .maybeSingle()

    if (enrollData) {
      isEnrolled = true
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .eq('is_completed', true)

      if (userProgress) {
        userProgress.forEach((p: { lesson_id: string }) => completedLessonIds.add(p.lesson_id))
      }
    }
  }

  const lessons: Lesson[] = (lessonsData || []).map((l: any) => {
    const isCompleted = isEnrolled && completedLessonIds.has(l.id)
    return {
      id: l.id,
      courseId: l.course_id || l.courseId,
      title: l.title,
      duration: l.duration,
      url: l.url,
      description: l.description,
      status: isCompleted ? 'completed' : 'not-started',
      order: l.order,
    }
  })

  const totalLessons = courseData.total_lessons || lessons.length || 0
  const completedCount = isEnrolled ? completedLessonIds.size : 0
  const progress = isEnrolled && totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0

  return {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    thumbnail: courseData.thumbnail,
    level: courseData.level,
    kindOfCourse: courseData.kind_of_course || courseData.kindOfCourse,
    totalLessons,
    progress,
    status: progress === 100 ? 'completed' : 'in-progress',
    ratingAvg: Number(courseData.rating_avg) || 0,
    ratingCount: Number(courseData.rating_count) || 0,
    lessons,
  }
}

export async function getLessonById(courseId: string, lessonId: string): Promise<Lesson | null> {
  const course = await getCourseById(courseId)
  if (!course) return null

  const lesson = course.lessons.find((l) => l.id === lessonId)
  return lesson || null
}

export async function getMyCourses(): Promise<Course[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. Lấy danh sách khóa học user đã đăng ký
  const { data: enrollData, error: enrollError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user.id)

  if (enrollError || !enrollData || enrollData.length === 0) {
    return []
  }

  const courseIds = enrollData.map((e: { course_id: string }) => e.course_id)

  // 2. Lấy chi tiết các khóa học này
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)

  if (coursesError || !coursesData) {
    return []
  }

  // 3. Lấy tiến độ các bài học đã hoàn thành
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('is_completed', true)

  const userProgressMap: Record<string, number> = {}
  if (progressData) {
    progressData.forEach((item: { course_id: string }) => {
      userProgressMap[item.course_id] = (userProgressMap[item.course_id] || 0) + 1
    })
  }

  // 4. Map dữ liệu khóa học kèm tiến độ
  return coursesData.map((c: any) => {
    const totalLessons = c.total_lessons || c.totalLessons || 0
    const completedLessons = userProgressMap[c.id] || 0
    const progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0
    const status = progress === 100 ? 'completed' : 'in-progress'

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      level: c.level,
      kindOfCourse: c.kind_of_course || c.kindOfCourse,
      totalLessons,
      progress,
      status,
      ratingAvg: Number(c.rating_avg) || 0,
      ratingCount: Number(c.rating_count) || 0,
      lessons: [],
    }
  })
}
