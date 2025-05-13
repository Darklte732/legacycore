import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
 
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies });
};

export const serverClient = createServerComponentClient({ cookies }); 