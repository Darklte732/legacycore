import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getBasePath(path: string): string {
  // Extract the base path (e.g., /admin/applications) from paths that may include parameters
  const segments = path.split('/');
  if (segments.length >= 3) {
    return `/${segments[1]}/${segments[2]}`; // returns /admin/applications from /admin/applications/something?param=value
  }
  return path;
}

export async function middleware(req: NextRequest) {
  // Skip middleware for RSC requests
  if (req.nextUrl.searchParams.has('_rsc')) {
    return NextResponse.next();
  }
  
  // Skip processing for static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') || 
    req.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Special handling for z12astrology account
  const z12AstrologyId = '980ebab6-9e1a-4c53-876a-978c8c640f7e'
  const { data: { session } } = await supabase.auth.getSession()
  
  // Check if current user is z12astrology account
  const isZ12Account = session?.user?.id === z12AstrologyId || 
                      session?.user?.email?.includes('z12astrology');
                      
  // If z12 account and on admin path, redirect to manager version
  if (isZ12Account && req.nextUrl.pathname.startsWith('/admin')) {
    // Map admin path to manager path for z12 account
    console.log('⚠️ Z12 ACCOUNT OVERRIDE: Redirecting from admin to manager path for z12 account');
    
    // Get the base admin path
    const basePath = getBasePath(req.nextUrl.pathname);
    
    // Map admin paths to manager paths
    let managerPath = basePath.replace('/admin', '/manager');
    
    // Preserve the rest of the path if it exists
    if (req.nextUrl.pathname.length > basePath.length) {
      managerPath += req.nextUrl.pathname.substring(basePath.length);
    }
    
    // Create redirect response
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = managerPath;
    redirectUrl.searchParams.set('z12override', Date.now().toString());
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Set manager cookies
    response.cookies.set('test_role', 'manager', { maxAge: 86400 }); 
    response.cookies.set('force_manager_view', 'true', { maxAge: 86400 });
    
    return response;
  }
  
  // Check for 'force_manager_view' cookie (highest priority)
  const forceManagerViewCookie = req.cookies.get('force_manager_view')
  const forceManagerView = forceManagerViewCookie?.value === 'true'
  
  // Check for test role cookie (second priority)
  const testRoleCookie = req.cookies.get('test_role')
  const testRole = testRoleCookie?.value
  
  // IMPORTANT FIX: If we're on an admin path, always clear the force_manager_view cookie
  // This prevents the double navigation issue
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('⚠️ MIDDLEWARE: Admin path detected, clearing force_manager_view cookie');
    
    // Don't clear cookies for z12 account
    if (!isZ12Account) {
      res.cookies.delete('force_manager_view');
      res.cookies.delete('test_role');
      res.cookies.delete('admin_redirected');
    }
    
    // If there was a force_manager_view cookie, reload the page to apply changes
    if (forceManagerView && !isZ12Account) {
      const reloadUrl = req.nextUrl.clone();
      reloadUrl.searchParams.set('reload', Date.now().toString());
      return NextResponse.redirect(reloadUrl);
    }
    
    // Continue with normal middleware processing but with cookies cleared
  }
  
  // If force manager view is enabled and we're on an admin path, redirect to manager path once
  // This code won't execute after the fix above, but keeping it for reference
  if (forceManagerView && req.nextUrl.pathname.startsWith('/admin')) {
    // Prevent redirect loops by checking for a previous redirect attempt
    const hasRedirected = req.cookies.get('admin_redirected')
    if (!hasRedirected) {
      console.log('⚠️ MIDDLEWARE: Force manager view enabled, redirecting from admin to manager path');
      const redirectUrl = req.nextUrl.clone()
      
      // Get the base admin path (e.g., /admin/applications)
      const basePath = getBasePath(req.nextUrl.pathname);
      
      // Map admin paths to manager paths
      let managerPath = basePath.replace('/admin', '/manager');
      
      // Preserve the rest of the path if it exists
      if (req.nextUrl.pathname.length > basePath.length) {
        managerPath += req.nextUrl.pathname.substring(basePath.length);
      }
      
      // Preserve query parameters
      redirectUrl.pathname = managerPath;
      
      // Set a cookie to track this redirect
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set('admin_redirected', 'true', { maxAge: 5 }) // Short-lived cookie
      return response
    }
    
    // If we've already redirected once, just let it through
    console.log('⚠️ MIDDLEWARE: Already redirected once, allowing admin path with force_manager_view');
    return NextResponse.next()
  }
  
  // For any other path with force_manager_view, don't redirect if already on a manager path
  if (forceManagerView) {
    if (req.nextUrl.pathname.startsWith('/manager')) {
      console.log('⚠️ MIDDLEWARE: Force manager view enabled, already on manager path');
      return NextResponse.next()
    }
    
    if (!req.nextUrl.pathname.startsWith('/manager') && !req.nextUrl.pathname.startsWith('/admin')) {
      console.log('⚠️ MIDDLEWARE: Force manager view enabled, redirecting to manager dashboard');
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/manager/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Clear the admin_redirected cookie for future navigations (except for z12 account)
  if (!isZ12Account) {
    res.cookies.delete('admin_redirected')
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/signup', 
    '/auth/callback', 
    '/auth/confirm', 
    '/forgot-password', 
    '/reset-password', 
    '/debug-password-reset', 
    '/test-page',
    '/test-cookie-redirect',
    '/fix-z12-account',
    '/manager/dashboard',
    '/manager/agents',
    '/manager/applications',
    '/manager/analytics',
    '/manager/carriers',
    '/manager/settings',
    '/agent/dashboard',
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
  
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    (route !== '/' && req.nextUrl.pathname.startsWith(route))
  )
  
  // Define role-specific paths
  const managerPaths = ['/manager']
  const agentPaths = ['/agent']
  const adminPaths = ['/admin']

  // Check if user is authenticated
  if (!session && !isPublicRoute) {
    // SPECIAL CASE: If force_manager_view is true but no session, still allow access to manager routes
    if (forceManagerView && req.nextUrl.pathname.startsWith('/manager')) {
      return res;
    }
    
    // For all other cases, redirect to login if accessing a protected route without a session
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated or we have a special cookie-based override
  let userRole = 'agent' // Default role
  
  // Determine role by priority:
  // 1. z12astrology special case (highest priority)
  // 2. force_manager_view cookie
  // 3. test_role cookie
  // 4. Database profile role
  
  // Special case for z12astrology account - always use manager role
  if (isZ12Account) {
    console.log('⚠️ Z12 ACCOUNT OVERRIDE: Always using manager role for z12astrology account');
    userRole = 'manager';
      
    // Also set manager cookies if not already set
    if (!forceManagerView) {
      res.cookies.set('test_role', 'manager', { maxAge: 86400 });
      res.cookies.set('force_manager_view', 'true', { maxAge: 86400 });
    }
  }
  // Force manager view cookie
  else if (forceManagerView) {
    console.log('⚠️ FORCED MANAGER VIEW: Using manager role from force_manager_view cookie');
    userRole = 'manager';
  } 
  // Other normal cases
  else if (session && session.user) {
    // Check for test role cookie
    if (testRole && ['admin', 'manager', 'agent'].includes(testRole)) {
      userRole = testRole;
      console.log(`⚠️ MIDDLEWARE: Using ${userRole} role from test_role cookie`);
    } 
    // Get role from database as last priority
    else {
      try {
        // Try to get user role from profiles
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        userRole = data?.role || 'agent' // Default to agent if no role found
        console.log(`Middleware: Using ${userRole} role from database profile`);
      } catch (error) {
        console.error('Error fetching user role from database:', error);
        // Default to agent if there's an error
        userRole = 'agent';
      }
    }
  } else if (testRole && ['admin', 'manager', 'agent'].includes(testRole)) {
    // No session but we have a test role cookie - use it
    userRole = testRole;
    console.log(`⚠️ MIDDLEWARE: Using ${userRole} role from test_role cookie without session`);
  }

  console.log(`Middleware: User role determined as ${userRole} for path ${req.nextUrl.pathname}`);

  // Skip role-based redirects for our public direct access routes
  if (isPublicRoute) {
    return res;
  }

  // Special case for z12 account - always allow access to manager paths
  if (isZ12Account) {
    // If trying to access admin paths, redirect to manager
    if (adminPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/manager/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
    
    // If already on manager paths, just allow it
    if (managerPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      return res;
    }
  }
  // Normal role-based access control
  else {
    // Check if trying to access manager/admin routes with wrong role
    if (adminPaths.some(path => req.nextUrl.pathname.startsWith(path)) && userRole !== 'admin') {
      // SPECIAL CASE: If force_manager_view is true, allow access to admin routes mapped to manager
      if (forceManagerView) {
        console.log('⚠️ MIDDLEWARE: Allowing admin access with force_manager_view');
        return res;
      }
      
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = userRole === 'manager' ? '/manager/dashboard' : '/agent/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    if (managerPaths.some(path => req.nextUrl.pathname.startsWith(path)) && 
        userRole !== 'manager' && userRole !== 'admin') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/agent/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 