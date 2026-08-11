'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isEmailTouched = email.trim() !== ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailError = isEmailTouched && !emailRegex.test(email) ? 'Email không đúng định dạng' : ''

  const isValid = isEmailTouched && !emailError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setSubmitError('')
    setSuccessMsg('')

    const formData = new FormData()
    formData.append('email', email)

    try {
      const result = await forgotPasswordAction(formData)
      if (result && result.success) {
        setSuccessMsg('Đã gửi liên kết khôi phục mật khẩu đến email của bạn! Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).')
      } else if (result && !result.success) {
        setSubmitError(result.error || 'Không thể gửi email khôi phục. Vui lòng thử lại.')
      }
    } catch {
      setSubmitError('Đã xảy ra sự cố kết nối. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-bg-primary">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-gradient-shift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] animate-gradient-shift" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/25">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-primary">LishTex</span>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 sm:p-10 animate-pulse-glow" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Quên mật khẩu?</h1>
            <p className="text-sm text-text-secondary">Nhập email đăng ký để nhận liên kết khôi phục mật khẩu</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }}>
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-emerald-400 dark:text-emerald-300">{successMsg}</p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-error-soft border border-error/20 rounded-xl flex items-center gap-3 animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }}>
              <svg className="w-5 h-5 text-error shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-error">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="forgot-email">
                Email đăng ký
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap@email.com"
                disabled={isLoading || !!successMsg}
                className={`glass-input w-full px-4 py-3 text-sm ${
                  emailError ? '!border-error focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
                }`}
              />
              {emailError && <p className="mt-1.5 text-xs font-medium text-error">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading || !!successMsg}
              className="btn-gradient w-full py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang gửi...
                </>
              ) : (
                'Gửi yêu cầu khôi phục'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Nhớ ra mật khẩu?{' '}
            <Link href="/auth/login" className="font-semibold gradient-text hover:opacity-80 transition-opacity">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
