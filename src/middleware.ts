import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  
  // Special handling for development mode with test accounts
  if (process.env.NODE_ENV === 'development') {
    // Check cookies for test account flags
    const isTestAccount = request.cookies.get('test_account')?.value
    
    if (isTestAccount) {
      const role = request.cookies.get('test_role')?.value
      
      // For development mode, allow access to role-specific dashboards
      if (role && ['admin', 'manager', 'agent'].includes(role)) {
        if (path.startsWith(`/${role}/`)) {
          return response
        }
        
        // If user tries to access another role's dashboard
        if (path.startsWith('/admin/') || path.startsWith('/manager/') || path.startsWith('/agent/')) {
          // Redirect to their proper dashboard
          return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
        }
      }
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/signup', 
    '/auth/callback', 
    '/preview',
    '/about-us',
    '/careers',
    '/contact',
    '/partners',
    '/documentation',
    '/support',
    '/blog',
    '/tutorials',
    '/privacy-policy',
    '/terms-of-service',
    '/cookies'
  ]
  if (publicRoutes.some(route => path === route || (route !== '/' && path.startsWith(route)))) {
    return response
  }

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle authenticated routes based on user role
  const userRole = session.user.user_metadata?.role as string || 'agent'

  // Role-based access control
  if (userRole === 'admin' && path.startsWith('/admin/')) {
    return response
  }
  
  if (userRole === 'manager' && path.startsWith('/manager/')) {
    return response
  }
  
  if (userRole === 'agent' && path.startsWith('/agent/')) {
    return response
  }

  // If trying to access an unauthorized route, redirect to their dashboard
  return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.gif|.*\\.ico|.*\\.css|.*\\.js).*)',
  ],
} 