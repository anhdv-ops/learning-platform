import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCourseById } from '@/lib/api'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import ProgressBar from '@/components/ProgressBar'

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

  const cookieStore = await cookies()

  const totalLessons = course.lessons.length
  const completedLessonsCount = course.lessons.filter(lesson =>
    lesson.status === 'completed' ||
    cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'
  ).length
  const progress = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* HERO SECTION */}
      <div className="relative w-full h-[35vh] min-h-[300px] max-h-[450px]">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-bg-primary/20" />

        {/* Course Info */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-12 max-w-5xl mx-auto flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full border border-white/10">
              {course.kindOfCourse}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider rounded-full border border-white/10">
              Level {course.level}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {course.title}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-3xl font-medium mb-4">
            {course.description}
          </p>

          {/* Progress Bar */}
          <div className="max-w-sm">
            <ProgressBar progress={progress} size="sm" />
          </div>
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
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Nội dung khóa học
          </h2>
          <span className="text-purple-300 font-semibold bg-purple-500/20 px-3 py-1 rounded-full text-sm border border-purple-500/30">
            {course.lessons.length} bài học
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {course.lessons.map((lesson, index) => {
            const isCompleted =
              lesson.status === 'completed' ||
              cookieStore.get(`completed_${course.id}_${lesson.id}`)?.value === 'true'

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
          })}
        </div>
      </div>
    </div>
  )
}
