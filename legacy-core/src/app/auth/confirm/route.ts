import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Verify the token
  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type,
    })

    if (!error) {
      // If this is a recovery (password reset), redirect to the reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      }
      
      // For other confirmation types, redirect to the next URL
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If there's an error or missing parameters, redirect to an error page
  return NextResponse.redirect(new URL('/login?error=Invalid or expired link', requestUrl.origin))
} 