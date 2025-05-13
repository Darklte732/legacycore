"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Session, type User } from '@supabase/supabase-js';

// Create a type for the hook return value
type UseAuthReturn = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (options: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
};

// Static return value for SSR
const staticAuthValue: UseAuthReturn = {
  user: null,
  session: null,
  loading: false,
  signIn: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
};

// Determine if we're running in a server context
const isServer = typeof window === 'undefined';

export function useAuth(): UseAuthReturn {
  // If running in a server context during build, return a static value
  if (isServer) {
    return staticAuthValue;
  }

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (options: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(options);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    resetPassword,
  };
}

// Export as default and named export for flexibility
export default useAuth; 