import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  if (!token) {
    if (pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } else {
    if (pathname === '/auth/login' || pathname === '/') {
      return NextResponse.redirect(new URL('/courses', request.url))
    }
  }
  return NextResponse.next()
}
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
