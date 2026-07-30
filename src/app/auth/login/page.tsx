'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Realtime validation cho Email
  useEffect(() => {
    if (email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setEmailError('Email không đúng định dạng')
      } else {
        setEmailError('')
      }
    } else {
      setEmailError('')
    }
  }, [email])

  // Realtime validation cho Password
  useEffect(() => {
    if (password.trim() !== '') {
      if (password.length < 6) {
        setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      } else {
        setPasswordError('')
      }
    } else {
      setPasswordError('')
    }
  }, [password])

  // Form chỉ hợp lệ khi cả 2 trường có dữ liệu và không có lỗi
  const isValid = email.trim().length > 0 && 
                  password.trim().length > 0 && 
                  emailError === '' && 
                  passwordError === ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) return

    setIsLoading(true)
    setSubmitError('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const result = await loginAction(formData)
      
      // Nếu không có redirect mà có kết quả trả về, tức là có lỗi
      if (result && !result.success) {
        setSubmitError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.')
        setIsLoading(false)
      }
    } catch (error: unknown) {
      // Đảm bảo không bắt nhầm lỗi do redirect từ Next.js
      if (
        error instanceof Error && 
        (error.message === 'NEXT_REDIRECT' || (error as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))
      ) {
        throw error
      }
      setSubmitError('Đã xảy ra sự cố kết nối. Vui lòng thử lại.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden p-4 sm:p-6 md:p-8 transition-colors duration-300">
      {/* Background Glow Effects (Premium UI detail) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Đăng Nhập</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Email Input Group */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full min-h-[44px] px-4 py-2.5 bg-white dark:bg-slate-950/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  emailError 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
                placeholder="nam@example.com"
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="mt-2 text-sm text-red-400 animate-pulse">{emailError}</p>
            )}
          </div>

          {/* Password Input Group */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full min-h-[44px] px-4 py-2.5 bg-white dark:bg-slate-950/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  passwordError 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {passwordError && (
              <p className="mt-2 text-sm text-red-400 animate-pulse">{passwordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`cursor-pointer w-full min-h-[44px] mt-2 font-medium rounded-xl transition-all duration-300 flex items-center justify-center
              ${isValid && !isLoading 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }
            `}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
