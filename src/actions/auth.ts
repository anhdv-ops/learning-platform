'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: 'Email và mật khẩu là bắt buộc' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Email không hợp lệ' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' }
  }

  const username = email.split('@')[0] || 'emilys'
  
  try {
    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.message === 'Invalid credentials' 
        ? 'Tài khoản/ Mật khẩu không tồn tại' 
        : (data.message || 'Đăng nhập thất bại từ API.')
      
      return { success: false, error: errorMessage }
    }

    const cookieStore = await cookies()
    cookieStore.set('token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  } catch (error) {
    return { success: false, error: 'Lỗi kết nối đến máy chủ xác thực.' }
  }
  redirect('/courses')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  redirect('/auth/login')
}
