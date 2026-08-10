import Link from 'next/link'

export default function CourseNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div
        className="glass-card p-8 sm:p-12 text-center max-w-lg w-full relative animate-scale-in"
        style={{ borderRadius: 'var(--radius-2xl)' }}
      >
        <div className="w-24 h-24 bg-accent-violet/10 rounded-2xl flex items-center justify-center mx-auto mb-8 relative border border-accent-violet/20">
          <span className="text-3xl font-black gradient-text">404</span>
          <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-bg-card rounded-xl flex items-center justify-center text-text-tertiary border border-border-subtle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">
          Khóa học không tồn tại
        </h2>

        <p className="text-text-secondary mb-10 text-sm font-medium">
          Rất tiếc, khóa học bạn đang tìm kiếm có thể đã bị xóa, tạm ẩn hoặc đường dẫn không chính xác.
        </p>

        <Link
          href="/courses"
          className="btn-gradient inline-flex items-center justify-center gap-3 w-full px-6 py-3.5 text-sm font-semibold"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về danh sách khóa học
        </Link>
      </div>
    </div>
  )
}
