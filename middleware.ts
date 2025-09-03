import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[MIDDLEWARE] ❌ Missing Supabase environment variables')
    console.error('[MIDDLEWARE] 💡 Please ensure your .env.local file contains:')
    console.error('[MIDDLEWARE]    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
    console.error('[MIDDLEWARE]    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    
    // For protected routes, redirect to login even if env vars are missing
    const protectedRoutes = ['/dashboard', '/profile']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    return NextResponse.next()
  }

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile']
  
  // Define auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup']

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check for Supabase session cookies
  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value
  
  // Simple session check - if we have both tokens, consider user authenticated
  const hasSession = accessToken && refreshToken

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !hasSession) {
    console.log(`[MIDDLEWARE] Redirecting unauthenticated user from ${pathname} to /login`)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If accessing auth routes with a valid session, redirect to dashboard
  if (isAuthRoute && hasSession) {
    console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to /dashboard`)
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Handle root path redirect
  if (pathname === '/') {
    if (hasSession) {
      console.log(`[MIDDLEWARE] Redirecting authenticated user from / to /dashboard`)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      console.log(`[MIDDLEWARE] Redirecting unauthenticated user from / to /login`)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
