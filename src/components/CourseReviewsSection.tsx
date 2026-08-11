'use client'

import { useState, useTransition } from 'react'
import { CourseReview, CourseRatingStats } from '@/types/review'
import { addOrUpdateReview, deleteReview } from '@/actions/reviews'

interface CourseReviewsSectionProps {
  courseId: string;
  isEnrolled: boolean;
  initialReviews: CourseReview[];
  initialStats: CourseRatingStats;
  initialUserReview: CourseReview | null;
}

export default function CourseReviewsSection({
  courseId,
  isEnrolled,
  initialReviews,
  initialStats,
  initialUserReview,
}: CourseReviewsSectionProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews)
  const [stats, setStats] = useState<CourseRatingStats>(initialStats)
  const [userReview, setUserReview] = useState<CourseReview | null>(initialUserReview)

  // Form states
  const [rating, setRating] = useState<number>(initialUserReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>(initialUserReview?.comment || '')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!isEnrolled) {
      setErrorMsg('Bạn cần đăng ký khóa học này để gửi nhận xét')
      return
    }

    startTransition(async () => {
      const res = await addOrUpdateReview(courseId, rating, comment)
      if (res.ok) {
        const isUpdate = Boolean(userReview)
        setSuccessMsg(isUpdate ? 'Đã cập nhật đánh giá thành công!' : 'Đã gửi đánh giá thành công!')
        
        const newReview: CourseReview = {
          id: userReview?.id || `temp-${Date.now()}`,
          courseId,
          userId: userReview?.userId || 'me',
          rating,
          comment,
          createdAt: userReview?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userEmail: 'Tôi',
        }
        
        setUserReview(newReview)

        // Optimistically update reviews list
        if (isUpdate) {
          setReviews(prev => prev.map(r => r.id === newReview.id ? newReview : r))
        } else {
          setReviews(prev => [newReview, ...prev])
          setStats(prev => ({
            ...prev,
            ratingCount: prev.ratingCount + 1,
            distribution: {
              ...prev.distribution,
              [rating as 1|2|3|4|5]: (prev.distribution[rating as 1|2|3|4|5] || 0) + 1,
            }
          }))
        }
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi gửi đánh giá')
      }
    })
  }

  const handleDeleteReview = async () => {
    if (!userReview) return
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá của mình?')) return

    setErrorMsg('')
    setSuccessMsg('')

    startTransition(async () => {
      const res = await deleteReview(courseId, userReview.id)
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== userReview.id))
        setStats(prev => ({
          ...prev,
          ratingCount: Math.max(0, prev.ratingCount - 1),
        }))
        setUserReview(null)
        setRating(5)
        setComment('')
        setSuccessMsg('Đã xóa đánh giá thành công')
      } else {
        setErrorMsg(res.error || 'Không thể xóa đánh giá')
      }
    })
  }

  return (
    <div className="mt-12 pt-10 border-t border-border-subtle">
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2.5">
        <svg className="w-6 h-6 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Đánh giá từ học viên ({stats.ratingCount})
      </h2>

      {/* RATING SUMMARY HEADER */}
      <div className="glass-card p-6 sm:p-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center text-center md:border-r border-border-subtle md:pr-6">
          <span className="text-5xl font-extrabold gradient-text tracking-tight mb-2">
            {stats.ratingAvg > 0 ? stats.ratingAvg.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.ratingAvg)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-600 fill-gray-600'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-text-tertiary font-medium">
            Đánh giá trung bình từ {stats.ratingCount} học viên
          </span>
        </div>

        {/* DISTRIBUTION BARS */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((starKey) => {
            const count = stats.distribution[starKey as 1|2|3|4|5] || 0
            const percent = stats.ratingCount > 0 ? Math.round((count / stats.ratingCount) * 100) : 0
            return (
              <div key={starKey} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-semibold text-text-secondary">{starKey} sao</span>
                <div className="flex-grow h-2.5 bg-bg-card rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 text-right text-text-tertiary font-mono">{percent}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ENROLLED USER REVIEW FORM */}
      {isEnrolled ? (
        <div className="glass-card p-6 mb-8 border-purple-500/20">
          <h3 className="text-lg font-bold text-text-primary mb-3">
            {userReview ? 'Đánh giá của bạn' : 'Viết đánh giá cho khóa học'}
          </h3>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 text-xs bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRatingSubmit} className="space-y-4">
            {/* Interactive Star Picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-secondary mr-2">Chọn số sao:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = s <= (hoverRating || rating)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          active ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  )
                })}
              </div>
              <span className="text-xs font-bold text-amber-400 ml-2">{hoverRating || rating} / 5 sao</span>
            </div>

            {/* Comment Textarea */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm và suy nghĩ của bạn về khóa học này..."
                rows={3}
                maxLength={2000}
                className="w-full p-4 rounded-xl bg-bg-card text-text-primary placeholder:text-text-tertiary border border-border-subtle focus:outline-none focus:border-accent-violet transition-colors text-sm resize-none"
              />
              <div className="text-right text-[11px] text-text-tertiary mt-1">
                {comment.length} / 2000 ký tự
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-accent-violet to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? 'Đang gửi...' : userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>

              {userReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                >
                  Xóa đánh giá
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card p-5 mb-8 text-center border-amber-500/20 bg-amber-500/5">
          <p className="text-sm font-medium text-text-secondary">
            Bạn cần <strong className="text-white">đăng ký khóa học</strong> để viết đánh giá và nhận xét.
          </p>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="glass-card p-8 text-center text-text-tertiary text-sm">
            Chưa có đánh giá nào cho khóa học này. Hãy là người đầu tiên gửi nhận xét!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="glass-card p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {rev.userEmail.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{rev.userEmail}</h4>
                    <span className="text-[11px] text-text-tertiary">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold text-amber-400">{rev.rating} ★</span>
                </div>
              </div>

              {rev.comment && (
                <p className="text-sm text-text-secondary leading-relaxed pl-12">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
