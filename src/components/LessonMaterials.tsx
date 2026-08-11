'use client'

import { useState, useTransition, useRef } from 'react'
import { LessonMaterial } from '@/types/material'
import { addLessonMaterial, deleteLessonMaterial } from '@/actions/materials'
import { createClient } from '@/lib/supabase/client'

interface Props {
  lessonId: string
  courseId: string
  initialMaterials: LessonMaterial[]
  currentUserId?: string
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function getFileType(file: File): 'pdf' | 'video' | 'document' | 'other' {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf'
  if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i)) return 'video'
  if (file.type.includes('word') || file.name.match(/\.(doc|docx|txt)$/i)) return 'document'
  return 'other'
}

function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') {
    return (
      <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h1.5a1.5 1.5 0 010 3H9m0-3v6m0-3h1.5" />
        </svg>
      </div>
    )
  }
  if (type === 'video') {
    return (
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }
  if (type === 'document') {
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    </div>
  )
}

export default function LessonMaterials({ lessonId, courseId, initialMaterials, currentUserId }: Props) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewItem, setPreviewItem] = useState<LessonMaterial | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!customTitle) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        setCustomTitle(nameWithoutExt)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Vui lòng chọn file cần tải lên')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const supabase = createClient()

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `${lessonId}/${fileName}`

      // Upload file lên Supabase Storage
      const { data: uploadData, error: storageError } = await supabase.storage
        .from('lesson-materials')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError) {
        throw new Error(storageError.message || 'Lỗi khi upload file lên Storage')
      }

      // Lấy Public URL của file
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-materials')
        .getPublicUrl(uploadData.path)

      const fileType = getFileType(selectedFile)

      // Lưu metadata vào DB kèm user_id và description
      const res = await addLessonMaterial({
        lessonId,
        courseId,
        title: customTitle || selectedFile.name,
        description: customDescription,
        fileUrl: publicUrl,
        fileType,
        fileSize: selectedFile.size,
      })

      if (res.ok) {
        setSelectedFile(null)
        setCustomTitle('')
        setCustomDescription('')
        setShowUploadModal(false)
      } else {
        setUploadError(res.error || 'Lỗi khi lưu thông tin tài liệu')
      }
    } catch (err: any) {
      setUploadError(err.message || 'Đã xảy ra lỗi khi tải file lên')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = (materialId: string) => {
    startDelete(async () => {
      const res = await deleteLessonMaterial(materialId, courseId, lessonId)
      if (!res.ok && res.error) {
        alert(res.error)
      }
    })
  }

  return (
    <>
      <div className="glass-card p-6 sm:p-8 mt-6 relative" style={{ borderRadius: 'var(--radius-2xl)' }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Tài liệu & Đính kèm bài học</h2>
              <p className="text-xs text-text-tertiary">
                {initialMaterials.length > 0
                  ? `${initialMaterials.length} tài liệu đính kèm liên quan`
                  : 'Chưa có tài liệu đính kèm'}
              </p>
            </div>
          </div>

          {currentUserId && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-gradient px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Tải lên tài liệu
            </button>
          )}
        </div>

        {/* Materials List */}
        {initialMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialMaterials.map((item) => {
              const isOwner = currentUserId === item.userId
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-border-accent transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <FileIcon type={item.fileType} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-primary truncate" title={item.title}>
                        {item.title}
                      </h3>

                      {/* Mô tả liên quan đến bài học */}
                      {item.description && (
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                          💡 {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-text-tertiary mt-2">
                        <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-input border border-border-subtle">
                          {item.fileType}
                        </span>
                        {item.fileSize > 0 && (
                          <span>{formatBytes(item.fileSize)}</span>
                        )}
                        {isOwner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-medium">
                            File của bạn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/50">
                    {(item.fileType === 'pdf' || item.fileType === 'video') && (
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-bg-input hover:bg-bg-input-focus text-text-primary text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem trực tuyến
                      </button>
                    )}

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-1.5 rounded-lg bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tải về
                    </a>

                    {/* CHỈ NGƯỜI UPLOAD MỚI CÓ NÚT XOÁ */}
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors cursor-pointer disabled:opacity-50"
                        title="Xoá tài liệu (Chỉ người upload mới có quyền)"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border-subtle rounded-xl">
            <p className="text-sm text-text-tertiary">Bài học này chưa có tài liệu đính kèm.</p>
          </div>
        )}
      </div>

      {/* Modals placed outside glass-card stacking context with z-[999] */}

      {/* Modal Preview File */}
      {previewItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col p-4 sm:p-6 animate-scale-in relative overflow-hidden shadow-2xl" style={{ borderRadius: 'var(--radius-2xl)' }}>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">{previewItem.title}</h3>
                {previewItem.description && (
                  <p className="text-xs text-text-secondary mt-0.5">{previewItem.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-text-tertiary hover:text-text-primary p-2 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-[400px] w-full bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
              {previewItem.fileType === 'pdf' ? (
                <iframe
                  src={previewItem.fileUrl}
                  className="w-full h-[600px] border-none"
                  title={previewItem.title}
                />
              ) : previewItem.fileType === 'video' ? (
                <video
                  src={previewItem.fileUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[600px] rounded-xl"
                />
              ) : (
                <p className="text-sm text-text-tertiary">Không hỗ trợ xem trước định dạng này.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 sm:p-8 animate-scale-in relative shadow-2xl" style={{ borderRadius: 'var(--radius-2xl)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">Upload tài liệu / Video bài học</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setUploadError(null)
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-error-soft text-error text-xs font-medium border border-error/20">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              {/* File picker */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Chọn File (PDF, DOCX, MP4, v.v.)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.mp4,.webm,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border border-dashed border-border-medium hover:border-accent-violet bg-bg-input/50 transition-all text-center cursor-pointer group"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileIcon type={getFileType(selectedFile)} />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{selectedFile.name}</p>
                        <p className="text-xs text-text-tertiary">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <svg className="w-8 h-8 mx-auto mb-2 text-text-tertiary group-hover:text-accent-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs font-medium text-text-secondary">Nhấn để chọn file từ máy tính</p>
                      <p className="text-[10px] text-text-tertiary mt-1">Hỗ trợ PDF, DOCX, MP4, TXT...</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tên hiển thị của tài liệu
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ví dụ: Slide bài giảng phần 1..."
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>

              {/* Description input for lesson relevance */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Nội dung / Ghi chú liên quan đến bài học
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Ví dụ: Tài liệu này chứa 50 từ vựng và bài tập thực hành cho Bài 1..."
                  rows={2}
                  className="glass-input w-full px-3 py-2 text-sm resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                    setUploadError(null)
                  }}
                  className="px-4 py-2 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="btn-gradient px-5 py-2 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang tải lên...
                    </>
                  ) : (
                    'Tải lên'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
