import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Auto-correct singular /course to /courses
  if (pathname === '/course' || pathname.startsWith('/course/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/course/, '/courses')
    return NextResponse.redirect(url)
  }

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). Safe try-catch wrapper to prevent 500 crash.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (err) {
    console.error('Middleware auth check error:', err)
    user = null
  }

  if (
    !user &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/auth')) {
    // user is logged in, potentially respond by redirecting the user to the home page
    const url = request.nextUrl.clone()
    url.pathname = '/courses'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
