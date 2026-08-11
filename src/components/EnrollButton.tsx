'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { enrollCourseAction } from '@/actions/enrollment'

interface Props {
  courseId: string
  initialEnrolled?: boolean
}

export default function EnrollButton({ courseId, initialEnrolled = false }: Props) {
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEnroll = async () => {
    if (isEnrolled) return

    // ⚡ Optimistic UI Update: Phản hồi TỨC THÌ 0ms trên màn hình người dùng
    setIsEnrolled(true)
    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await enrollCourseAction(courseId)
      if (res.ok) {
        // Làm mới dữ liệu ngầm dưới nền
        startTransition(() => {
          router.refresh()
        })
      } else {
        // Đảo ngược state nếu xảy ra lỗi (ví dụ: chưa đăng nhập)
        setIsEnrolled(false)
        if (res.error === 'Unauthenticated') {
          router.push('/auth/login')
        } else {
          setErrorMsg(res.error || 'Đăng ký thất bại, vui lòng thử lại!')
        }
      }
    } catch {
      setIsEnrolled(false)
      setErrorMsg('Đã xảy ra lỗi khi đăng ký!')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <span className="px-4 py-2 bg-emerald-500/90 backdrop-blur-md text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border border-emerald-400/30 flex items-center gap-2 w-fit shadow-md animate-fade-in">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Đã đăng ký
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleEnroll}
        disabled={isLoading || isPending}
        className="btn-gradient px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait text-sm sm:text-base w-fit"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Đăng ký học ngay
          </>
        )}
      </button>
      {errorMsg && (
        <p className="text-xs text-error font-medium">{errorMsg}</p>
      )}
    </div>
  )
}
