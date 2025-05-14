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

// List of problematic routes that are returning 500 errors with RSC requests
const problematicRscRoutes = [
  '/signup',
  '/contact',
  '/privacy-policy',
  '/terms-of-service'
];

// In static export mode, we need a minimal middleware
export function middleware(req: NextRequest) {
  // Just pass through all requests, since auth is handled client-side
  const res = NextResponse.next();
      return res;
    }
    
// Limit middleware to specific paths to avoid issues with static assets
export const config = {
  matcher: [
    // Apply middleware only to these specific routes
    '/agent/:path*',
    '/manager/:path*',
    '/admin/:path*',
    // Exclude static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)'
  ],
}; 