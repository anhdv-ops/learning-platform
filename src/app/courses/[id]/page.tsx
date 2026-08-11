import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCourseById } from '@/lib/api'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import ProgressBar from '@/components/ProgressBar'
import EnrollButton from '@/components/EnrollButton'
import { checkIsEnrolled } from '@/actions/enrollment'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const course = await getCourseById(params.id)

  if (!course) {
    return {
      title: 'Khóa học không tồn tại',
    }
  }

  return {
    title: `${course.title} | LishTex`,
    description: course.description,
  }
}

export async function generateStaticParams() {
  return [
    { id: 'c1' },
    { id: 'c2' },
    { id: 'c3' },
  ]
}

export default async function CourseDetailPage(props: Props) {
  const params = await props.params
  const course = await getCourseById(params.id)

  if (!course) {
    notFound()
  }

  const isEnrolled = await checkIsEnrolled(course.id)
  const cookieStore = await cookies()

  const totalLessons = course.lessons.length
  const completedLessonsCount = isEnrolled ? course.lessons.filter(lesson =>
    lesson.status === 'completed' ||
    cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'
  ).length : 0
  const progress = isEnrolled && totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* HERO SECTION */}
      <div className="relative w-full h-[38vh] min-h-[320px] max-h-[480px]">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

        {/* Course Info */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-12 max-w-5xl mx-auto flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full border border-white/10">
              {course.kindOfCourse}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full border border-white/10">
              Level {course.level}
            </span>
            {isEnrolled && (
              <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Đã đăng ký
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">
            {course.title}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-3xl font-medium mb-5 drop-shadow-sm">
            {course.description}
          </p>

          {/* Action: Enroll Button or Progress Bar */}
          {isEnrolled ? (
            <div className="max-w-sm">
              <ProgressBar progress={progress} size="sm" />
            </div>
          ) : (
            <div>
              <EnrollButton courseId={course.id} initialEnrolled={isEnrolled} />
            </div>
          )}
        </div>
      </div>

      {/* LESSON LIST */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Back navigation */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2.5 text-text-secondary hover:text-accent-violet font-medium transition-colors mb-8 group text-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-bg-card flex items-center justify-center border border-border-subtle group-hover:border-border-accent group-hover:bg-accent-violet/10 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          Quay lại danh sách khóa học
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2.5">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Nội dung khóa học
          </h2>
          <span className="text-purple-700 dark:text-purple-300 font-semibold bg-purple-500/10 dark:bg-purple-500/20 px-3 py-1 rounded-full text-sm border border-purple-500/20 dark:border-purple-500/30">
            {course.lessons.length} bài học
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {course.lessons.map((lesson, index) => {
            const isCompleted =
              lesson.status === 'completed' ||
              cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'

            if (isEnrolled) {
              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.id}/lessons/${lesson.id}`}
                  className={`group glass-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5 relative overflow-hidden hover:border-border-accent animate-slide-up stagger-${Math.min(index + 1, 9)}`}
                >
                  {/* Accent line on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-violet to-accent-cyan scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />

                  <div className="flex items-center gap-4 sm:gap-5 flex-grow">
                    {/* Number */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-bg-card text-text-tertiary font-bold text-sm rounded-xl group-hover:bg-accent-violet/10 group-hover:text-accent-violet transition-colors border border-border-subtle">
                      {index + 1}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-violet transition-colors">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-text-tertiary text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {Math.round(lesson.duration / 60)} phút
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 pl-14 sm:pl-0">
                    {isCompleted ? (
                      <span className="px-3 py-1.5 bg-success-soft text-success text-[11px] font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 w-fit border border-success/20">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Đã học
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-bg-card text-text-secondary px-3 py-1.5 rounded-full border border-border-subtle">
                        Chưa học
                      </span>
                    )}
                  </div>
                </Link>
              )
            }

            // Locked lesson (Not enrolled)
            return (
              <div
                key={lesson.id}
                className={`glass-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5 relative overflow-hidden opacity-75 cursor-not-allowed select-none animate-slide-up stagger-${Math.min(index + 1, 9)}`}
              >
                <div className="flex items-center gap-4 sm:gap-5 flex-grow">
                  {/* Lock Icon Number */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-bg-card text-text-tertiary font-bold text-sm rounded-xl border border-border-subtle">
                    <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-secondary">
                        {lesson.title}
                      </h3>
                      <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-text-tertiary text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.round(lesson.duration / 60)} phút
                    </div>
                  </div>
                </div>

                {/* Locked Badge */}
                <div className="flex-shrink-0 pl-14 sm:pl-0">
                  <span className="text-xs font-semibold bg-bg-card text-text-tertiary px-3 py-1.5 rounded-full border border-border-subtle flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Đã khóa
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
