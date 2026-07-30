'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center max-w-lg w-full relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
        
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Đã xảy ra lỗi kết nối!
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Hệ thống không thể tải dữ liệu khóa học lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
        </p>
        
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="w-full px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/30"
        >
          Thử lại ngay
        </button>
      </div>
    </div>
  )
}
