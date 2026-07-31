import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCourseById } from '@/lib/api'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import ProgressBar from '@/components/ProgressBar'

// Note: Trong Next.js 15, params trong dynamic routes là một Promise
type Props = {
  params: Promise<{ id: string }>
}

// 1. Tạo Metadata động cho SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const course = await getCourseById(params.id)
  
  if (!course) {
    return {
      title: 'Khóa học không tồn tại',
    }
  }

  return {
    title: `${course.title} | Learning Platform`,
    description: course.description,
  }
}

// 2. SSG: Pre-render một số khóa học phổ biến lúc build
export async function generateStaticParams() {
  return [
    { id: 'c1' },
    { id: 'c2' },
    { id: 'c3' },
  ]
}

// 3. Main Server Component
export default async function CourseDetailPage(props: Props) {
  const params = await props.params
  const course = await getCourseById(params.id)

  // Bắt lỗi 404 nếu không tìm thấy ID
  if (!course) {
    notFound()
  }

  // Đọc toàn bộ cookie một lần để check trạng thái hoàn thành của bài học
  const cookieStore = await cookies()

  // Tính toán tiến độ học tập (Progress Tracking)
  const totalLessons = course.lessons.length
  const completedLessonsCount = course.lessons.filter(lesson => 
    lesson.status === 'completed' || 
    cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'
  ).length
  const progress = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="relative w-full h-[40vh] min-h-[350px] max-h-[500px]">
        {/* Cover Image */}
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay để làm nổi bật text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent" />
        
        {/* Course Info */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/30">
              {course.kindOfCourse}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full">
              Level {course.level}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
            {course.title}
          </h1>
          <p className="text-slate-200 text-base sm:text-lg max-w-3xl font-medium drop-shadow mb-2">
            {course.description}
          </p>
          
          {/* Thanh Tiến Độ Học Tập */}
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* LESSON LIST SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Navigation - Quay lại danh sách khóa học */}
        <Link 
          href="/courses"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold transition-colors mb-8 group w-fit"
        >
          <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          Quay lại danh sách khóa học
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Nội dung khóa học
          </h2>
          <span className="text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-100 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full text-sm">
            {course.lessons.length} bài học
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {course.lessons.map((lesson, index) => {
            // Kiểm tra xem user đã hoàn thành bài này chưa (từ DB mock hoặc cookie)
            const isCompleted = 
              lesson.status === 'completed' || 
              cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'

            return (
            <Link 
              key={lesson.id} 
              href={`/courses/${course.id}/lessons/${lesson.id}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-card rounded-2xl shadow-sm hover:shadow-md hover:shadow-indigo-500/5 transition-all border border-border-subtle hover:border-indigo-300 dark:hover:border-indigo-500/50 relative overflow-hidden"
            >
              {/* STYLING BORDER HOVER EFFECT */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
              
              <div className="flex items-center gap-4 sm:gap-6 flex-grow">
                {/* Number indicator */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background text-slate-400 font-black text-lg rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {index + 1}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-indigo-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-text-secondary text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.round(lesson.duration / 60)} phút
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0 pl-16 sm:pl-0">
                {isCompleted ? (
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 w-fit">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã học
                  </span>
                ) : (
                  <span className="text-sm font-bold bg-background text-text-primary px-4 py-2 rounded-xl group-hover:bg-border-subtle transition-colors border border-border-subtle">
                        CHƯA HỌC
                  </span>
                )}
              </div>
            </Link>
          )})}
        </div>
      </div>
    </div>
  )
}
