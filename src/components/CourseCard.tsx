import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import ProgressBar from './ProgressBar'
import { Course } from '@/types/course'

interface CourseCardProps {
  course: Course;
}

export default async function CourseCard({ course }: CourseCardProps) {
  // Đọc cookie để tính toán tiến độ thực tế (nếu user đã click ở trang bài học)
  const cookieStore = await cookies()
  let completedCount = 0
  
  // Vì ta đang mock 4 bài học mỗi khóa với ID dạng l1-courseId, ta có thể lặp để check:
  for (let i = 1; i <= 4; i++) {
    if (cookieStore.get(`completed_${course.id}_l${i}-${course.id}`)?.value === 'true') {
      completedCount++
    }
  }

  // Tính toán chính xác tiến độ học tập (bỏ qua dữ liệu giả lập cũ của course.progress)
  // Vì có 4 bài học mock, mỗi bài chiếm 25%
  const calculatedProgress = (completedCount / 4) * 100

  return (
    <Link href={`/courses/${course.id}`} className="group relative flex flex-col bg-card rounded-[2rem] overflow-hidden border border-border-subtle transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:scale-105 hover:!border-indigo-500/30 h-full">
      {/* Thumbnail Container (Framed Style) */}
      <div className="relative w-auto aspect-[4/3] overflow-hidden bg-background m-2.5 rounded-t-[1.5rem] rounded-b-xl">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/10 to-transparent opacity-50" />

        {/* Vibrant Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/40 border border-white/20">
            {course.kindOfCourse}
          </span>
          <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/40 border border-white/20">
            Lvl {course.level}
          </span>
        </div>

        {/* Interactive Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 scale-90 group-hover:scale-100">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl ring-1 ring-white/50 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-extrabold tracking-tight text-text-primary mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>

        {/* Thanh tiến độ */}
        <div className="mb-5">
          <ProgressBar progress={calculatedProgress} variant="light" size="sm" />
        </div>

        {/* Fancy Action Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
            <span className="text-sm font-bold text-text-primary">
              {course.totalLessons} <span className="font-medium text-text-secondary">bài học</span>
            </span>
          </div>
          
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 text-zinc-400 group-hover:shadow-lg group-hover:shadow-indigo-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
