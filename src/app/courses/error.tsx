'use client'

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
      <div
        className="glass-card p-8 sm:p-12 text-center max-w-lg w-full relative overflow-hidden animate-scale-in"
        style={{ borderRadius: 'var(--radius-2xl)' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error to-warning" />

        <div className="w-16 h-16 bg-error-soft text-error rounded-2xl flex items-center justify-center mx-auto mb-6 border border-error/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-3">
          Đã xảy ra lỗi kết nối!
        </h2>

        <p className="text-text-secondary text-sm mb-8 font-medium">
          Hệ thống không thể tải dữ liệu khóa học lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
        </p>

        <button
          onClick={() => reset()}
          className="btn-gradient w-full px-6 py-3 text-sm font-semibold"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          Thử lại ngay
        </button>
      </div>
    </div>
  )
}
