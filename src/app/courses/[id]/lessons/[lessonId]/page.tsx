import { getLessonById } from '@/lib/api'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import MarkCompleteButton from '@/components/MarkCompleteButton'
import VideoPlayer from '@/components/VideoPlayer'
import LessonComments from '@/components/LessonComments'
import LessonMaterials from '@/components/LessonMaterials'
import { checkIsEnrolled } from '@/actions/enrollment'
import { getComments } from '@/actions/comments'
import { getLessonMaterials } from '@/actions/materials'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function LessonDetailPage(props: Props) {
  const params = await props.params

  const isEnrolled = await checkIsEnrolled(params.id)
  if (!isEnrolled) {
    redirect(`/courses/${params.id}`)
  }

  const lesson = await getLessonById(params.id, params.lessonId)

  if (!lesson) {
    notFound()
  }

  const isCompleted = lesson.status === 'completed'

  // Fetch comments, materials, and current user for lesson page
  const [comments, materials, supabase] = await Promise.all([
    getComments(params.lessonId),
    getLessonMaterials(params.lessonId),
    createClient(),
  ])
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3 mb-8 flex-wrap text-sm">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-violet font-medium transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-bg-card flex items-center justify-center border border-border-subtle group-hover:border-border-accent group-hover:bg-accent-violet/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            Trang chủ
          </Link>
          <span className="text-text-tertiary">/</span>
          <Link
            href={`/courses/${params.id}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-violet font-medium transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-bg-card flex items-center justify-center border border-border-subtle group-hover:border-border-accent group-hover:bg-accent-violet/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Quay lại khóa học
          </Link>
        </div>

        {/* Video Player Thumbnail */}
        <VideoPlayer
          url={lesson.url}
          title={lesson.title}
          lessonId={lesson.id}
          courseId={lesson.courseId}
        />

        {/* Lesson Info Card */}
        <div className="glass-card p-6 sm:p-8" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple-500/20 dark:border-purple-500/30">
                  Bài {lesson.order}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.round(lesson.duration / 60)} phút
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                {lesson.title}
              </h1>
            </div>

            {/* Mark Complete Button */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <MarkCompleteButton
                courseId={params.id}
                lessonId={params.lessonId}
                initialCompleted={isCompleted}
              />
            </div>
          </div>

          {/* Lesson Content */}
          <div className="text-text-secondary text-sm leading-relaxed">
            <p>
              {lesson.description || 'Tổng quan chi tiết về mục tiêu và nội dung khóa học.'}
            </p>
          </div>
        </div>

        {/* Lesson Materials / Documents Section */}
        <LessonMaterials
          lessonId={params.lessonId}
          courseId={params.id}
          initialMaterials={materials}
          currentUserId={user?.id}
        />

        {/* Q&A / Comments Section */}
        <LessonComments
          lessonId={params.lessonId}
          courseId={params.id}
          initialComments={comments}
          currentUserId={user?.id}
        />
      </div>
    </div>
  )
}
