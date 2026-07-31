'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // TỐI ƯU: Tính toán lỗi trực tiếp lúc render, không dùng useEffect (Derived State)
  const isEmailTouched = email.trim() !== '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = isEmailTouched && !emailRegex.test(email) ? 'Email không đúng định dạng' : '';

  const isPasswordTouched = password.trim() !== '';
  const passwordError = isPasswordTouched && password.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : '';

  const isValid = isEmailTouched && isPasswordTouched && !emailError && !passwordError;

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
      
      if (result && !result.success) {
        setSubmitError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.')
        setIsLoading(false)
      }
    } catch (error: unknown) {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Hero / Branding */}
        <div className="flex flex-col gap-6 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">LishTex</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Nâng tầm tiếng Anh <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
              mở lối tương lai
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
            Khám phá lộ trình học tiếng Anh cá nhân hóa. Luyện nghe, nói, đọc, viết với các bài học tương tác và giảng viên bản xứ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              500+ Bài học
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              AI chấm điểm
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Chứng chỉ quốc tế
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="order-1 lg:order-2 w-full max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white dark:!bg-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10 rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:!text-white">Chào mừng trở lại</h2>
              <p className="text-sm text-slate-500 dark:!text-slate-300 mt-2">Đăng nhập để tiếp tục hành trình học tập</p>
            </div>

            {submitError && (
              <div className="mb-6 p-4 bg-red-50 dark:!bg-red-500/10 border border-red-200 dark:!border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 text-red-500 dark:!text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-600 dark:!text-red-400">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:!text-slate-200 mb-1" htmlFor="email">
                  Email
                </label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nhap@email.com"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:!bg-slate-900 border text-slate-900 dark:!text-white transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    emailError 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
                {emailError && <p className="mt-1.5 text-sm font-medium text-red-500 dark:!text-red-400">{emailError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:!text-slate-200" htmlFor="password">
                    Mật khẩu
                  </label>
                </div>
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:!bg-slate-900 border text-slate-900 dark:!text-white transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    passwordError 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
                {passwordError && <p className="mt-1.5 text-sm font-medium text-red-500 dark:!text-red-400">{passwordError}</p>}
              </div>

              <button 
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full py-3 px-4 font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isValid && !isLoading 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-slate-200 dark:!bg-slate-700 text-slate-500 dark:!text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
