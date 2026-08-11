'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Comment } from '@/types/comment'
import { addComment, deleteComment } from '@/actions/comments'

interface Props {
  lessonId: string
  courseId: string
  initialComments: Comment[]
  currentUserId?: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'vừa xong'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  return `${Math.floor(months / 12)} năm trước`
}

function getAvatarColor(userId: string): string {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
  ]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitial(name: string): string {
  if (name.startsWith('Học viên')) return '?'
  return name.charAt(0).toUpperCase()
}

// ── Single Comment Component ──
function CommentItem({
  comment,
  courseId,
  lessonId,
  currentUserId,
  onReply,
  isReply = false,
}: {
  comment: Comment
  courseId: string
  lessonId: string
  currentUserId?: string
  onReply?: (parentId: string) => void
  isReply?: boolean
}) {
  const [isDeleting, startDelete] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const isOwner = currentUserId === comment.userId

  const handleDelete = () => {
    startDelete(async () => {
      await deleteComment(comment.id, courseId, lessonId)
      setShowConfirm(false)
    })
  }

  return (
    <div
      className={`group animate-fade-in ${isReply ? 'ml-10 sm:ml-14' : ''}`}
      style={{ animationDuration: '0.2s' }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(comment.userId)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}
        >
          {getInitial(comment.userEmail)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-text-primary truncate max-w-[200px]">
              {comment.userEmail}
            </span>
            <span className="text-xs text-text-tertiary">
              {timeAgo(comment.createdAt)}
            </span>
            {isOwner && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-violet bg-accent-violet/10 rounded-md border border-accent-violet/20">
                Bạn
              </span>
            )}
          </div>

          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isReply && onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-text-tertiary hover:text-accent-violet font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Trả lời
              </button>
            )}
            {isOwner && !showConfirm && (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-text-tertiary hover:text-error font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xoá
              </button>
            )}
            {showConfirm && (
              <div className="flex items-center gap-2 animate-scale-in">
                <span className="text-xs text-error">Xác nhận xoá?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2 py-0.5 text-xs font-semibold bg-error/10 text-error rounded-md hover:bg-error/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Xoá'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-2 py-0.5 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-border-subtle">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              courseId={courseId}
              lessonId={lessonId}
              currentUserId={currentUserId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main LessonComments Component ──
export default function LessonComments({ lessonId, courseId, initialComments, currentUserId }: Props) {
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isReplyPending, startReplyTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus reply textarea
  useEffect(() => {
    if (replyTo && replyRef.current) {
      replyRef.current.focus()
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [replyTo])

  const handleSubmit = () => {
    if (!content.trim()) return
    setError(null)

    startTransition(async () => {
      const res = await addComment(lessonId, courseId, content)
      if (res.ok) {
        setContent('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } else {
        setError(res.error || 'Đã xảy ra lỗi')
      }
    })
  }

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return
    setError(null)

    startReplyTransition(async () => {
      const res = await addComment(lessonId, courseId, replyContent, parentId)
      if (res.ok) {
        setReplyContent('')
        setReplyTo(null)
      } else {
        setError(res.error || 'Đã xảy ra lỗi')
      }
    })
  }

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="glass-card p-6 sm:p-8 mt-6" style={{ borderRadius: 'var(--radius-2xl)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Hỏi đáp & Thảo luận</h2>
          <p className="text-xs text-text-tertiary">
            {initialComments.length > 0
              ? `${initialComments.length} bình luận`
              : 'Hãy là người đầu tiên bình luận!'}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-error-soft text-error text-sm font-medium border border-error/20 animate-scale-in">
          {error}
        </div>
      )}

      {/* Comment form */}
      {currentUserId ? (
        <div className="mb-8">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                handleTextareaResize(e)
              }}
              placeholder="Viết câu hỏi hoặc bình luận của bạn..."
              rows={3}
              maxLength={2000}
              className="glass-input w-full px-4 py-3 text-sm resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-tertiary">
              {content.length}/2000 · Ctrl+Enter để gửi
            </span>
            <button
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              className="btn-gradient px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Gửi bình luận
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 px-4 py-4 rounded-xl bg-bg-card border border-border-subtle text-center">
          <p className="text-sm text-text-secondary">
            Bạn cần <span className="text-accent-violet font-semibold">đăng nhập</span> và <span className="text-accent-violet font-semibold">đăng ký khóa học</span> để bình luận.
          </p>
        </div>
      )}

      {/* Comments List */}
      {initialComments.length > 0 ? (
        <div className="space-y-5">
          {initialComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                courseId={courseId}
                lessonId={lessonId}
                currentUserId={currentUserId}
                onReply={(parentId) => {
                  setReplyTo(replyTo === parentId ? null : parentId)
                  setReplyContent('')
                }}
              />

              {/* Inline reply form */}
              {replyTo === comment.id && (
                <div className="ml-10 sm:ml-14 mt-3 animate-slide-up">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/50 to-cyan-500/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <textarea
                        ref={replyRef}
                        value={replyContent}
                        onChange={(e) => {
                          setReplyContent(e.target.value)
                          handleTextareaResize(e)
                        }}
                        placeholder={`Trả lời ${comment.userEmail}...`}
                        rows={2}
                        maxLength={2000}
                        className="glass-input w-full px-3 py-2 text-sm resize-none leading-relaxed"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleReply(comment.id)
                          }
                          if (e.key === 'Escape') {
                            setReplyTo(null)
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={isReplyPending || !replyContent.trim()}
                          className="btn-gradient px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReplyPending ? 'Đang gửi...' : 'Trả lời'}
                        </button>
                        <button
                          onClick={() => setReplyTo(null)}
                          className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-secondary font-medium transition-colors cursor-pointer"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Separator between root comments */}
              <div className="border-b border-border-subtle mt-5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 flex items-center justify-center border border-border-subtle">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-text-tertiary font-medium">Chưa có bình luận nào</p>
          <p className="text-xs text-text-tertiary mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      )}
    </div>
  )
}
