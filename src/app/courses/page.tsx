import { getCourses } from '@/lib/api'
import { logoutAction } from '@/actions/auth'
import CourseCard from '@/components/CourseCard'
import SearchFilter from '@/components/SearchFilter'
import Pagination from '@/components/Pagination'

export const revalidate = 60

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function CoursesPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const level = typeof searchParams.level === 'string' ? searchParams.level : undefined
  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1'
  
  const page = parseInt(pageParam, 10) || 1

  const { courses, totalPages, currentPage } = await getCourses(page, q, level)

  return (
    <div className="min-h-screen pb-24">
      {}
      <header className="pt-16 pb-12 px-6 lg:px-8 max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-zinc-900 dark:text-white">
            Khám Phá
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Chương trình đào tạo chất lượng cao được thiết kế chuyên biệt để bứt phá kỹ năng của bạn.
          </p>
        </div>
        
        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            Đăng xuất
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </form>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {}
        <SearchFilter />

        {}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-4xl mb-6">📭</span>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Không có kết quả</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-16">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            
            {}
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </>
        )}
      </main>
    </div>
  )
}
