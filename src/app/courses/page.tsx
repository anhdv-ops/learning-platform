import { Metadata } from 'next'
import { getCourses } from '@/lib/api'
import CourseCard from '@/components/CourseCard'
import SearchFilter from '@/components/SearchFilter'
import Pagination from '@/components/Pagination'

export const metadata: Metadata = {
  title: 'Danh sách khóa học',
  description: 'Khám phá tất cả các khóa học tiếng Anh phong phú theo các trình độ từ sơ cấp đến nâng cao tại LishTex.',
  openGraph: {
    title: 'Danh sách khóa học | LishTex',
    description: 'Khám phá tất cả các khóa học tiếng Anh phong phú tại LishTex.',
    url: '/courses',
  },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function CoursesPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams

  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : undefined
  let level = typeof searchParams.level === 'string' ? searchParams.level.trim() : undefined
  if (level) {
    if (level === '7.0' || level === '7.0 ') level = '7.0+'
    if (level === '750' || level === '750 ') level = '750+'
    if (level === '5.0' || level === '5.0 ') level = '5.0+'
    if (level === '6.0' || level === '6.0 ') level = '6.0+'
    if (level === '500' || level === '500 ') level = '500+'
    if (level === '650' || level === '650 ') level = '650+'
  }

  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const page = parseInt(pageParam, 10) || 1

  const { courses, totalPages, currentPage } = await getCourses(page, q, level)

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <header className="pt-10 pb-8 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-text-primary">
            Khám Phá
          </h1>
          <p className="text-base text-text-secondary font-medium leading-relaxed">
            Chương trình đào tạo chất lượng cao được thiết kế chuyên biệt để bứt phá kỹ năng của bạn.
          </p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Search & Filter */}
        <SearchFilter />

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-bg-card flex items-center justify-center mb-6 border border-border-subtle">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-text-primary mb-2">Không có kết quả</h3>
            <p className="text-text-secondary text-sm">
              Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <>
            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {courses.map((course, index) => (
                <div key={course.id} className={`animate-slide-up stagger-${Math.min(index + 1, 9)}`}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </main>
    </div>
  )
}
