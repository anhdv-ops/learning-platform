import Link from 'next/link'

export default function CourseNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center max-w-lg w-full relative">
        <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <span className="text-4xl font-black">404</span>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Khóa học không tồn tại
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">
          Rất tiếc, khóa học bạn đang tìm kiếm có thể đã bị xóa, tạm ẩn hoặc đường dẫn không chính xác.
        </p>
        
        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về danh sách khóa học
        </Link>
      </div>
    </div>
  )
}
