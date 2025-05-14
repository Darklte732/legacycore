import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'

// For development/testing purposes
const TEST_USERS = {
  MANAGER: {
    email: 'manager@legacycore.io',
    password: 'password',
    role: 'manager'
  },
  AGENT: {
    email: 'agent@legacycore.io',
    password: 'password',
    role: 'agent'
  },
  ADMIN: {
    email: 'admin@legacycore.io',
    password: 'password',
    role: 'admin'
  }
}

// Helper to set cookies for dev mode
const setDevModeCookies = (role: string) => {
  // Set cookies to identify test account in middleware
  document.cookie = `test_account=true; path=/; max-age=86400`;
  document.cookie = `test_role=${role}; path=/; max-age=86400`;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)
      } catch (err) {
        console.error('Error fetching session:', err)
        setError(err instanceof Error ? err.message : 'Error fetching auth session')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      // For development mode, we can implement a simpler login for testing
      if (process.env.NODE_ENV === 'development') {
        // Check if it's one of our test users
        if (['admin@legacycore.io', 'manager@legacycore.io', 'agent@legacycore.io'].includes(email) && password === 'password') {
          const role = email.split('@')[0]; // Extract role from email
          
          // Set dev mode cookies
          setDevModeCookies(role);
          
          // Skip Supabase auth for test accounts in development mode
          console.log("Dev mode direct redirect for test account:", role);
          
          // Simulate authentication to maintain the flow
          setUser({
            id: `test-${role}-id`,
            email: email,
            role: role,
            app_metadata: { provider: 'email' },
            user_metadata: { role: role },
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as any);
          
          // Redirect to appropriate dashboard based on role
          const dashboardPath = role === 'admin' 
            ? '/admin/dashboard' 
            : role === 'manager' 
              ? '/manager/dashboard' 
              : '/agent/dashboard';
          
          console.log(`Redirecting to ${dashboardPath}`);
          window.location.href = dashboardPath;
          
          setLoading(false);
          return { success: true, message: "Logged in successfully!" };
        }
      }
      
      // Use email/password authentication instead of magic link
      console.log('Signing in with email/password');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }
      
      if (data && data.user) {
        console.log('Authentication successful:', data);
        
        // Get user role from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        const role = profileData?.role || 'agent';
        
        // Redirect to appropriate dashboard based on role
        const dashboardPath = role === 'admin' 
          ? '/admin/dashboard' 
          : role === 'manager' 
            ? '/manager/dashboard' 
            : '/agent/dashboard';
        
        console.log(`Redirecting to ${dashboardPath}`);
        window.location.href = dashboardPath;
        
        return { success: true, message: "Logged in successfully!" };
      }
      
      return { success: true, message: "Authentication successful!" };
    } catch (err) {
      console.error('Error signing in:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign in')
      throw err;
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Clear dev mode cookies if they exist
      if (process.env.NODE_ENV === 'development') {
        document.cookie = 'test_account=; path=/; max-age=0';
        document.cookie = 'test_role=; path=/; max-age=0';
      }
      
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign out')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      console.log('Initiating password reset for:', email);
      
      // Handling for test accounts - ALWAYS use Supabase for password resets now
      // This will ensure password reset works in development mode
      if (
        ['admin@legacycore.io', 'manager@legacycore.io', 'agent@legacycore.io'].includes(email)
      ) {
        console.log('Test account detected, but proceeding with actual password reset');
      }
      
      // Send password reset email
      console.log('Calling Supabase resetPasswordForEmail with redirectTo:', new URL('/auth/confirm', window.location.origin).toString());
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL('/auth/confirm', window.location.origin).toString(),
      })

      if (error) {
        console.error('Supabase resetPasswordForEmail error:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully:', data);
      return {
        success: true,
        message: "Password reset instructions sent to your email."
      }
    } catch (err) {
      console.error('Error resetting password:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during password reset')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: new URL('/auth/callback', window.location.origin).toString(),
          data: {
            role: 'agent', // Default role for new signups
            first_name: firstName,
            last_name: lastName
          }
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Create a profile for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'agent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }
      
      return { success: true, message: "Check your email to confirm your account!" };
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    resetPassword,
    TEST_USERS // Expose the test users for easy reference
  }
} 