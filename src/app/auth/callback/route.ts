import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.auth.exchangeCodeForSession(code)
    
    // Check user role and redirect appropriately
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Get the user's profile to determine their role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      // Redirect based on role
      if (profile?.role) {
        return NextResponse.redirect(
          new URL(
            profile.role === 'admin' 
              ? '/admin/dashboard' 
              : profile.role === 'manager' 
                ? '/manager/dashboard' 
                : '/agent/dashboard',
            requestUrl.origin
          )
        )
      }
    }
  }

  // If no code or no role, redirect to the default page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 