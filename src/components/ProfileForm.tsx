'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { UserProfile } from '@/types/profile'
import { updateProfile, uploadAvatarAction } from '@/actions/profile'

interface ProfileFormProps {
  initialProfile: UserProfile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState<string>(initialProfile.fullName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh tối đa là 2MB')
      return
    }

    setErrorMsg('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    startTransition(async () => {
      let finalAvatarUrl = avatarUrl

      // 1. Upload avatar if new file selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const uploadRes = await uploadAvatarAction(formData)

        if (!uploadRes.ok || !uploadRes.publicUrl) {
          setErrorMsg(uploadRes.error || 'Tải ảnh đại diện thất bại')
          return
        }
        finalAvatarUrl = uploadRes.publicUrl
        setAvatarUrl(finalAvatarUrl)
        setPreviewUrl(null)
        setSelectedFile(null)
      }

      // 2. Update profile name and avatar_url
      const updateRes = await updateProfile(fullName, finalAvatarUrl)
      if (updateRes.ok) {
        setSuccessMsg('Đã cập nhật thông tin hồ sơ thành công!')
      } else {
        setErrorMsg(updateRes.error || 'Cập nhật thất bại')
      }
    })
  }

  const currentDisplayAvatar = previewUrl || avatarUrl

  return (
    <div className="glass-card p-6 sm:p-10 max-w-2xl mx-auto rounded-2xl animate-fade-in border-border-subtle">
      <h2 className="text-2xl font-bold text-text-primary mb-6 tracking-tight flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        Thông tin cá nhân
      </h2>

      {errorMsg && (
        <div className="p-4 mb-6 text-xs bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 animate-slide-up">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 text-xs bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 animate-slide-up">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AVATAR UPLOADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border-subtle">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden relative ring-4 ring-purple-500/20 glass-card flex items-center justify-center bg-gradient-to-tr from-accent-violet to-accent-cyan text-white text-3xl font-extrabold shadow-xl">
              {currentDisplayAvatar ? (
                <Image
                  src={currentDisplayAvatar}
                  alt={fullName || 'Avatar'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                (fullName || initialProfile.email).slice(0, 2).toUpperCase()
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-violet text-white flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-text-primary">Ảnh đại diện</h3>
            <p className="text-xs text-text-tertiary">
              Định dạng PNG, JPG, WEBP hoặc GIF. Dung lượng tối đa 2MB.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-bg-card hover:bg-bg-card-hover text-text-secondary text-xs font-semibold rounded-xl border border-border-subtle transition-all"
            >
              Chọn ảnh từ máy tính
            </button>
          </div>
        </div>

        {/* INPUT FIELDS */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-card text-text-primary border border-border-subtle focus:outline-none focus:border-accent-violet transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Địa chỉ Email (Không thể thay đổi)
            </label>
            <input
              type="email"
              value={initialProfile.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-bg-card/50 text-text-tertiary border border-border-subtle text-sm cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-gradient-to-r from-accent-violet to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isPending ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
