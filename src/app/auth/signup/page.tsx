'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signupAction } from '@/actions/auth'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isEmailTouched = email.trim() !== ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailError = isEmailTouched && !emailRegex.test(email) ? 'Email không đúng định dạng' : ''

  const isPhoneTouched = phone.trim() !== ''
  const cleanPhoneInput = phone.replace(/[\s\-\(\)]/g, '')
  const vnPhoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/
  const phoneError = isPhoneTouched && !vnPhoneRegex.test(cleanPhoneInput) ? 'Số điện thoại không đúng định dạng (VD: 0987654321)' : ''

  const isPasswordTouched = password.trim() !== ''
  const passwordError = isPasswordTouched && password.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : ''

  const isConfirmTouched = confirmPassword.trim() !== ''
  const confirmPasswordError = isConfirmTouched && confirmPassword !== password ? 'Mật khẩu xác nhận không khớp' : ''

  const isValid =
    isEmailTouched &&
    !emailError &&
    !phoneError &&
    isPasswordTouched &&
    !passwordError &&
    isConfirmTouched &&
    !confirmPasswordError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (emailError) {
      setSubmitError(emailError)
      return
    }
    if (phoneError) {
      setSubmitError(phoneError)
      return
    }
    if (passwordError) {
      setSubmitError(passwordError)
      return
    }
    if (confirmPasswordError) {
      setSubmitError(confirmPasswordError)
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('phone', phone)
    formData.append('password', password)
    formData.append('confirmPassword', confirmPassword)

    try {
      const result = await signupAction(formData)
      if (result && result.success) {
        setSuccessMsg('Đăng ký tài khoản thành công! Hệ thống đang chuyển hướng về trang đăng nhập...')
        setTimeout(() => {
          router.push('/auth/login')
          router.refresh()
        }, 1500)
      } else {
        setSubmitError(result?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-bg-primary">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-gradient-shift" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-gradient-shift" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[80px] animate-float" />
      </div>

      <div className="relative z-10 max-w-md w-full my-8 animate-slide-up">
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
        <div className="glass-card p-6 sm:p-8 animate-pulse-glow" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5">Tạo tài khoản mới</h1>
            <p className="text-sm text-text-secondary">Bắt đầu hành trình học tập miễn phí</p>
          </div>

          {successMsg && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }}>
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-emerald-400 dark:text-emerald-300">{successMsg}</p>
            </div>
          )}

          {submitError && (
            <div className="mb-5 p-4 bg-error-soft border border-error/20 rounded-xl flex items-center gap-3 animate-scale-in" style={{ borderRadius: 'var(--radius-lg)' }}>
              <svg className="w-5 h-5 text-error shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-error">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="signup-email">
                Email <span className="text-error">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap@email.com"
                disabled={isLoading}
                className={`glass-input w-full px-4 py-2.5 text-sm ${
                  emailError ? '!border-error focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
                }`}
              />
              {emailError && <p className="mt-1.5 text-xs font-medium text-error">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="signup-phone">
                Số điện thoại
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                disabled={isLoading}
                className={`glass-input w-full px-4 py-2.5 text-sm ${
                  phoneError ? '!border-error focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
                }`}
              />
              {phoneError && <p className="mt-1.5 text-xs font-medium text-error">{phoneError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="signup-password">
                Mật khẩu <span className="text-error">*</span>
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`glass-input w-full px-4 py-2.5 text-sm ${
                  passwordError ? '!border-error focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
                }`}
              />
              {passwordError && <p className="mt-1.5 text-xs font-medium text-error">{passwordError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="signup-confirm-password">
                Xác nhận mật khẩu <span className="text-error">*</span>
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`glass-input w-full px-4 py-2.5 text-sm ${
                  confirmPasswordError ? '!border-error focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
                }`}
              />
              {confirmPasswordError && <p className="mt-1.5 text-xs font-medium text-error">{confirmPasswordError}</p>}
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="btn-gradient w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="font-semibold gradient-text hover:opacity-80 transition-opacity">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-slide-up stagger-3">
          {['500+ Bài học', 'AI chấm điểm', 'Chứng chỉ quốc tế'].map((feature) => (
            <span
              key={feature}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-full"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
