'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function translateSupabaseAuthError(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('rate limit exceeded') || msg.includes('over_email_send_rate_limit')) {
    return 'Hệ thống nhận thấy quá nhiều yêu cầu trong thời gian ngắn. Vui lòng đợi từ 5 đến 10 phút rồi thử lại.'
  }
  if (msg.includes('is invalid') || msg.includes('invalid email')) {
    return 'Địa chỉ email này bị hệ thống từ chối hoặc không đúng định dạng. Vui lòng kiểm tra lại email.'
  }
  if (msg.includes('already registered') || msg.includes('already in use') || msg.includes('already exists') || msg.includes('user_already_exists')) {
    return 'Email/Gmail này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc Đăng nhập.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
  }
  if (msg.includes('password should be at least')) {
    return 'Mật khẩu phải có ít nhất 6 ký tự.'
  }
  return message
}

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
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: translateSupabaseAuthError(error.message) }
  }

  return { success: true }
}

export async function signupAction(formData: FormData) {
  try {
    const email = formData.get('email')
    const phone = formData.get('phone')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (typeof email !== 'string' || typeof password !== 'string') {
      return { success: false, error: 'Email và mật khẩu là bắt buộc' }
    }

    const cleanEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Email không đúng định dạng' }
    }

    const cleanPhone = typeof phone === 'string' ? phone.replace(/[\s\-\(\)]/g, '') : ''
    if (cleanPhone !== '') {
      // Regex chuẩn số điện thoại Việt Nam (10 số bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84/84)
      const vnPhoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/
      if (!vnPhoneRegex.test(cleanPhone)) {
        return { success: false, error: 'Số điện thoại không đúng định dạng Việt Nam (VD: 0987654321 hoặc +84987654321)' }
      }
    }

    if (password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Mật khẩu xác nhận không khớp' }
    }

    const supabase = await createClient()

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          phone: cleanPhone,
        },
      },
    })

    if (error) {
      return { success: false, error: translateSupabaseAuthError(error.message) }
    }

    // Trường hợp Supabase trả về identities rỗng khi email đã tồn tại
    if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      return { success: false, error: 'Email/Gmail này đã được đăng ký tài khoản. Vui lòng chọn email khác hoặc Đăng nhập.' }
    }

    // Đăng xuất sau khi đăng ký thành công để chuyển hướng về trang đăng nhập sạch sẽ
    await supabase.auth.signOut()

    return { success: true }
  } catch (err: any) {
    console.error('Lỗi khi thực hiện signupAction:', err)
    return { success: false, error: translateSupabaseAuthError(err?.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.') }
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string') {
    return { success: false, error: 'Email là bắt buộc' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Email không hợp lệ' }
  }

  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { success: false, error: translateSupabaseAuthError(error.message) }
  }

  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  try {
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (typeof password !== 'string' || password.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Mật khẩu xác nhận không khớp' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { success: false, error: translateSupabaseAuthError(error.message) }
    }

    // Đăng xuất sau khi đổi mật khẩu thành công để yêu cầu người dùng đăng nhập lại với mật khẩu mới
    await supabase.auth.signOut()

    return { success: true }
  } catch (err: any) {
    return { success: false, error: translateSupabaseAuthError(err?.message || 'Đã xảy ra lỗi khi cập nhật mật khẩu.') }
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  redirect('/auth/login')
}
