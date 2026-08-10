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
        <div className="mt-auto">
          {course.progress > 0 && (
            <div className="mb-3">
              <ProgressBar progress={course.progress} size="sm" hideLabel />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                {course.totalLessons}
              </span>
              <span className="text-sm text-text-tertiary">bài học</span>
            </div>

            {course.progress > 0 && (
              <span className="text-xs font-semibold gradient-text">
                {Math.round(course.progress)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
