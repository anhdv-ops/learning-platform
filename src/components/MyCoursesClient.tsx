'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Course } from '@/types/course'
import CourseCard from '@/components/CourseCard'

interface Props {
  initialCourses: Course[]
}

type TabType = 'all' | 'in-progress' | 'completed'

export default function MyCoursesClient({ initialCourses }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const totalEnrolled = initialCourses.length
  const inProgressCount = initialCourses.filter(c => c.progress < 100).length
  const completedCount = initialCourses.filter(c => c.progress === 100).length

  const filteredCourses = initialCourses.filter(course => {
    if (activeTab === 'in-progress') return course.progress < 100
    if (activeTab === 'completed') return course.progress === 100
    return true
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Khóa học của tôi
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Theo dõi tiến độ học tập và tiếp tục bài học của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Enrolled */}
        <div className="glass-card p-5 flex items-center gap-4" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-accent-violet border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Đã đăng ký</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{totalEnrolled}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card p-5 flex items-center gap-4" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-accent-cyan border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Đang học</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{inProgressCount}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-card p-5 flex items-center gap-4" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-purple-500/15 text-accent-violet border border-purple-500/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          Tất cả ({totalEnrolled})
        </button>

        <button
          onClick={() => setActiveTab('in-progress')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'in-progress'
              ? 'bg-purple-500/15 text-accent-violet border border-purple-500/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          Đang học ({inProgressCount})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-purple-500/15 text-accent-violet border border-purple-500/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          Đã hoàn thành ({completedCount})
        </button>
      </div>

      {/* Courses List Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 text-center max-w-md mx-auto" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-border-subtle flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">
            {activeTab === 'all'
              ? 'Bạn chưa đăng ký khóa học nào'
              : activeTab === 'in-progress'
              ? 'Không có khóa học nào đang học'
              : 'Chưa có khóa học hoàn thành'}
          </h3>
          <p className="text-xs text-text-tertiary mb-6">
            {activeTab === 'all'
              ? 'Hãy khám phá danh sách các khóa học phong phú và đăng ký học ngay nhé!'
              : 'Tiếp tục hoàn thành bài học để xem trạng thái cập nhật ở đây.'}
          </p>
          <Link
            href="/courses"
            className="btn-gradient px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Khám phá khóa học
          </Link>
        </div>
      )}
    </div>
  )
}
