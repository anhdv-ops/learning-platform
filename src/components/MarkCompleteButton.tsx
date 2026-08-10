'use client'

import { useState } from 'react'
import { markLessonCompleted } from '@/actions/progress'

interface Props {
  courseId: string
  lessonId: string
  initialCompleted?: boolean
}

export default function MarkCompleteButton({ courseId, lessonId, initialCompleted = false }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(initialCompleted)

  const handleComplete = async () => {
    if (isCompleted) return
    setIsLoading(true)

    try {
      const res = await markLessonCompleted(courseId, lessonId)
      if (res.ok) {
        setIsCompleted(true)
      }
    } catch {
      alert('Đã xảy ra lỗi, vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isLoading || isCompleted}
      className={`
        px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto text-sm cursor-pointer
        ${isCompleted
          ? 'bg-success-soft text-success border border-success/20 cursor-default'
          : 'btn-gradient disabled:opacity-60 disabled:cursor-wait'
        }
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Đang cập nhật...
        </>
      ) : isCompleted ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Đã hoàn thành
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Đánh dấu Hoàn thành
        </>
      )}
    </button>
  )
}
