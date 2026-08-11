import Image from 'next/image'
import Link from 'next/link'
import ProgressBar from './ProgressBar'
import { Course } from '@/types/course'

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex flex-col glass-card overflow-hidden h-full glow-border"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          quality={80}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-600/90 backdrop-blur-md text-white rounded-full border border-white/10">
            {course.kindOfCourse}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white rounded-full border border-white/10">
            Lvl {course.level}
          </span>
        </div>

        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/20 text-white shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Progress bar at bottom of thumbnail */}
        {course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div
              className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan transition-all duration-700"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold tracking-tight text-text-primary mb-2 group-hover:text-accent-violet transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>

        {/* Progress + Meta */}
        <div className="mt-auto pt-3 border-t border-border-subtle/50">
          {/* Rating Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {course.ratingCount && course.ratingCount > 0 ? (
                <span className="text-text-primary">
                  {course.ratingAvg?.toFixed(1)}{' '}
                  <span className="text-text-tertiary font-normal">({course.ratingCount})</span>
                </span>
              ) : (
                <span className="text-amber-400/90 font-medium">★ Mới</span>
              )}
            </div>

            {course.progress > 0 && (
              <span className="text-xs font-semibold gradient-text">
                {Math.round(course.progress)}%
              </span>
            )}
          </div>

          {course.progress > 0 && (
            <div className="mb-2">
              <ProgressBar progress={course.progress} size="sm" hideLabel />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-text-primary">
                {course.totalLessons}
              </span>
              <span>bài học</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
