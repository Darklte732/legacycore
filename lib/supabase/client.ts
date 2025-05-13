'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';

export const createClient = () => {
  if (typeof window === 'undefined') {
    // Return a mock client for SSR/build time
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({
              limit: async () => ({ data: null, error: null }),
            }),
          }),
          in: () => ({ data: null, error: null }),
          order: () => ({
            limit: async () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({ data: null, error: null }),
        update: () => ({
          eq: () => ({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => ({ data: null, error: null }),
        }),
      }),
    };
  }
  
  return createClientComponentClient<Database>();
};

export default createClient; 