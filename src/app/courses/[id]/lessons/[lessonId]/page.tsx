import { getLessonById } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MarkCompleteButton from '@/components/MarkCompleteButton'
import { cookies } from 'next/headers'

type Props = {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function LessonDetailPage(props: Props) {
  const params = await props.params
  
  // Gọi API lấy dữ liệu chi tiết bài học
  const lesson = await getLessonById(params.id, params.lessonId)

  // Nếu bài học không tồn tại -> 404
  if (!lesson) {
    notFound()
  }

  // Đọc cookie xem user đã từng đánh dấu hoàn thành bài này chưa (Mock Database)
  const cookieStore = await cookies()
  const hasCompletedCookie = cookieStore.get(`completed_${params.id}_${params.lessonId}`)?.value === 'true'
  const isCompleted = hasCompletedCookie || lesson.status === 'completed'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Navigation - Quay lại khóa học */}
        <Link 
          href={`/courses/${params.id}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold transition-colors mb-8 group"
        >
          <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          Quay lại khóa học
        </Link>

        {/* Video Player Khu vực môt phỏng */}
        <div className="w-full aspect-video bg-slate-900 rounded-3xl mb-10 shadow-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
          <div className="flex flex-col items-center gap-4">
            <button className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:scale-110">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="text-white/50 text-sm font-medium tracking-wide">
              Trình phát Video (Mô phỏng)
            </div>
          </div>
        </div>

        {/* Thông tin Bài học chi tiết */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3.5 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-black uppercase tracking-wider rounded-full">
                  Bài {lesson.order}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-bold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.round(lesson.duration / 60)} phút
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {lesson.title}
              </h1>
            </div>
            
            {/* Nút Client Component - Đánh dấu hoàn thành */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <MarkCompleteButton 
                courseId={params.id} 
                lessonId={params.lessonId} 
                initialCompleted={isCompleted}
              />
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
              {lesson.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
