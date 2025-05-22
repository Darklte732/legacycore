import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/roles'

export const useRole = () => {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [lastRedirectTime, setLastRedirectTime] = useState(0)
  const supabase = createClient()

  // Clear all role-related cookies
  const clearAllRoleCookies = () => {
    console.log('Clearing all role-related cookies to prevent conflicts');
    document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "handling_redirect=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  // Forces clearing admin role from metadata and cookies
  const forceClearAdminRole = async (userId: string, email: string) => {
    console.log('⚠️ SECURITY: Forcing removal of admin role for unauthorized user');
    
    // Clear all role-related cookies
    clearAllRoleCookies();
    
    // Update profile in database
    try {
      // Set to agent role by default
      await supabase
        .from('profiles')
        .update({ role: 'agent' })
        .eq('id', userId);
      
      console.log('Updated database role from admin to agent');
      
      // Update auth metadata to match
      const { error } = await supabase.auth.updateUser({
        data: { role: 'agent' }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
      }
      
      // Force redirect to agent dashboard
      setTimeout(() => window.location.href = '/agent/dashboard', 100);
      
    } catch (error) {
      console.error('Error clearing admin role:', error);
    }
  };

  // Fix metadata to match database profile
  const syncMetadataWithProfile = async (userId: string, profileRole: UserRole) => {
    try {
      console.log(`Synchronizing user metadata role to match database: ${profileRole}`);
      const { error } = await supabase.auth.updateUser({
        data: { role: profileRole }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
      }
    } catch (error) {
      console.error('Error synchronizing roles:', error);
    }
  };

  // Safely redirect to correct path based on role
  const safeRedirect = (targetRole: UserRole) => {
    // Prevent redirect loops by checking if we've redirected recently (within 2 seconds)
    const now = Date.now();
    if (redirecting || (now - lastRedirectTime < 2000)) {
      console.log('Preventing potential redirect loop');
      return;
    }
    
    setRedirecting(true);
    setLastRedirectTime(now);
    
    // Set cookie to indicate we're handling the redirection
    document.cookie = "handling_redirect=true; path=/; max-age=5";
    
    // Delay redirect slightly to allow state to settle
    setTimeout(() => {
      console.log(`Redirecting to /${targetRole}/dashboard`);
      window.location.href = `/${targetRole}/dashboard`;
      setRedirecting(false);
    }, 100);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Check if we need to adjust roles based on the current path
        const pathname = window.location.pathname;
        const isAdminPath = pathname.startsWith('/admin');
        const isManagerPath = pathname.startsWith('/manager');
        const isAgentPath = pathname.startsWith('/agent');
        
        // If on a specific path, ensure cookie doesn't override for that path
        if (isAdminPath || isManagerPath || isAgentPath) {
          // If we're on a specific role path, clear conflicting cookies
          // to ensure the correct sidebar is shown
          const testRoleCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('test_role='))
            ?.split('=')[1];
            
          // If on agent path but test cookie is not agent, clear it
          if (isAgentPath && testRoleCookie && testRoleCookie !== 'agent') {
            console.log(`Path is /agent but test_role cookie is ${testRoleCookie}, clearing to prevent sidebar mismatch`);
            clearAllRoleCookies();
          }
          
          // If on manager path but test cookie is not manager, clear it
          if (isManagerPath && testRoleCookie && testRoleCookie !== 'manager') {
            console.log(`Path is /manager but test_role cookie is ${testRoleCookie}, clearing to prevent sidebar mismatch`);
            clearAllRoleCookies();
          }
          
          // If on admin path but test cookie is not admin, clear it
          if (isAdminPath && testRoleCookie && testRoleCookie !== 'admin') {
            console.log(`Path is /admin but test_role cookie is ${testRoleCookie}, clearing to prevent sidebar mismatch`);
            clearAllRoleCookies();
          }
        }
        
        // Skip role check if we're already handling a redirect
        if (document.cookie.includes('handling_redirect=true')) {
          console.log('Skipping role check - redirect in progress');
          setLoading(false);
          return;
        }
        
        // Check for the force_manager_view cookie in any environment
        const forceManagerView = document.cookie
          .split('; ')
          .find(row => row.startsWith('force_manager_view='))
          ?.split('=')[1];
        
        // For development mode with test accounts via cookies
        const testRoleCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('test_role='))
          ?.split('=')[1];
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setRole(null)
          setLoading(false)
          return
        }
        
        // SECURITY CHECK: List of allowed admin user IDs
        const ALLOWED_ADMIN_IDS = [
          // Real admin users from Supabase
          '980ebab6-9e1a-4c53-876a-978c8c640f7e', // z12astrology@gmail.com
          'adbdb861-5ce8-4b5c-af50-7deb93a687c1', // admin@legacycore.io
        ];
        
        // If user claims admin role but isn't in allowed list, force clear the role
        if (session.user.user_metadata?.role === 'admin' && !ALLOWED_ADMIN_IDS.includes(session.user.id)) {
          await forceClearAdminRole(session.user.id, session.user.email || '');
          setRole('agent');
          setLoading(false);
          return;
        }
        
        // DIRECT ROLE ASSIGNMENTS (Highest priority)
        
        // 1. Force manager view check
        if (forceManagerView === 'true') {
          console.log('⚠️ FORCED MANAGER VIEW: Using manager role from force_manager_view cookie');
          
          // Update database profile to match
          await ensureProfileHasRole(session.user.id, session.user.email, 'manager');
          
          setRole('manager');
          setLoading(false);
          return;
        }
        
        // 2. Determine role based on current path if on a specific role path
        if (isAgentPath) {
          // If on agent path, override cookies/testing and set to agent role
          console.log('👉 On agent path, ensuring agent role and sidebar');
          if (testRoleCookie) {
            // Clear the test role cookie to prevent sidebar mismatch
            clearAllRoleCookies();
          }
          setRole('agent');
          setLoading(false);
          return;
        }
        
        if (isManagerPath) {
          // If on manager path, override cookies/testing and set to manager role
          console.log('👉 On manager path, ensuring manager role and sidebar');
          if (testRoleCookie) {
            // Clear the test role cookie to prevent sidebar mismatch
            clearAllRoleCookies();
          }
          setRole('manager');
          setLoading(false);
          return;
        }
        
        if (isAdminPath) {
          // If on admin path, ensure admin role if allowed
          if (ALLOWED_ADMIN_IDS.includes(session.user.id)) {
            console.log('👉 On admin path with valid admin ID, ensuring admin role and sidebar');
            if (testRoleCookie) {
              // Clear the test role cookie to prevent sidebar mismatch
              clearAllRoleCookies();
            }
            setRole('admin');
            setLoading(false);
            return;
          } else {
            // Redirect non-admin users away from admin path
            console.log('⚠️ SECURITY: Non-admin attempting to access admin path');
            clearAllRoleCookies();
            safeRedirect('agent');
            return;
          }
        }
        
        // 3. Special user check - santos.joseph1998@gmail.com
        if (session.user.id === '56e8e969-76fd-4d69-a8ca-3e315487c2c4') {
          console.log('⚠️ APPLYING ROLE OVERRIDE: Setting role to manager for santosUser');
          
          // Update database profile to match
          await ensureProfileHasRole(session.user.id, session.user.email, 'manager');
          
          setRole('manager');
          setLoading(false);
          return;
        }
        
        // 4. Development mode test role cookie
        if (testRoleCookie && ['admin', 'manager', 'agent'].includes(testRoleCookie)) {
          // Prevent non-authorized users from using admin role via cookies
          if (testRoleCookie === 'admin' && !ALLOWED_ADMIN_IDS.includes(session.user.id)) {
            console.log('⚠️ SECURITY: Unauthorized admin access attempt via cookie. Defaulting to agent role.');
            document.cookie = "test_role=agent; path=/; max-age=86400";
            setRole('agent');
            setLoading(false);
            return;
          }
          
          console.log(`⚠️ DEVELOPMENT MODE: Using ${testRoleCookie} role from test_role cookie`);
          setRole(testRoleCookie as UserRole);
          setLoading(false);
          return;
        }
        
        // 5. Database profile check (highest priority in production)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile && profile.role) {
          console.log(`Using role from database profile: ${profile.role}`);
          
          // Security check: Prevent unauthorized admin roles in database
          if (profile.role === 'admin' && !ALLOWED_ADMIN_IDS.includes(session.user.id)) {
            console.warn('⚠️ SECURITY: Unauthorized admin role in database. Correcting to agent.');
            await forceClearAdminRole(session.user.id, session.user.email || '');
            setRole('agent');
            setLoading(false);
            return;
          }
          
          // Validate role from metadata against database role to prevent mismatches
          if (session.user.user_metadata?.role && session.user.user_metadata.role !== profile.role) {
            console.warn(`⚠️ Role mismatch: metadata (${session.user.user_metadata.role}) vs database (${profile.role}). Using database role.`);
            // Sync metadata with database profile to prevent future mismatches
            await syncMetadataWithProfile(session.user.id, profile.role as UserRole);
          }
          
          // Set the correct role from the database profile
          setRole(profile.role as UserRole);
          
          // Force corrected role based on path if there's a mismatch
          if (pathname.startsWith('/admin') && profile.role !== 'admin') {
            console.log(`⚠️ Path mismatch: User with role ${profile.role} on admin path. Redirecting...`);
            setLoading(false);
            safeRedirect(profile.role as UserRole);
            return;
          }
          
          if (pathname.startsWith('/manager') && profile.role !== 'manager') {
            console.log(`⚠️ Path mismatch: User with role ${profile.role} on manager path. Redirecting...`);
            setLoading(false);
            safeRedirect(profile.role as UserRole);
            return;
          }
          
          if (pathname.startsWith('/agent') && profile.role !== 'agent') {
            console.log(`⚠️ Path mismatch: User with role ${profile.role} on agent path. Redirecting...`);
            setLoading(false);
            safeRedirect(profile.role as UserRole);
            return;
          }
          
          setLoading(false);
          return;
        }
        
        // If no profile found, check user metadata before defaulting
        if (session.user.user_metadata?.role && ['admin', 'manager', 'agent'].includes(session.user.user_metadata.role)) {
          // Security check: Prevent unauthorized admin roles in metadata
          if (session.user.user_metadata.role === 'admin' && !ALLOWED_ADMIN_IDS.includes(session.user.id)) {
            console.warn('⚠️ SECURITY: Unauthorized admin role in metadata. Correcting to agent.');
            await forceClearAdminRole(session.user.id, session.user.email || '');
            setRole('agent');
            setLoading(false);
            return;
          }
          
          console.log(`Using role from user metadata (no profile): ${session.user.user_metadata.role}`);
          // Create profile with this role
          await createProfile(session.user.id, session.user.email, session.user.user_metadata.role);
          setRole(session.user.user_metadata.role as UserRole);
        } else {
          // Create profile with default agent role
          console.log('No role found. Defaulting to agent role.');
          await createProfile(session.user.id, session.user.email || '', 'agent');
          setRole('agent');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error determining user role:', error);
        setRole(null);
        setLoading(false);
      }
    };
    
    // Create a profile for the user with the given role
    const createProfile = async (userId: string, email: string, userRole: string) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({ id: userId, email, role: userRole })
          .select();
        
        if (error) {
          console.error('Error creating user profile:', error);
        }
      } catch (error) {
        console.error('Error in profile creation:', error);
      }
    };
    
    // Ensure a profile exists with the given role
    const ensureProfileHasRole = async (userId: string, email: string, userRole: string) => {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (existingProfile) {
          // Update if role doesn't match
          if (existingProfile.role !== userRole) {
            await supabase
              .from('profiles')
              .update({ role: userRole })
              .eq('id', userId);
            
            console.log(`Updated profile role from ${existingProfile.role} to ${userRole}`);
          }
        } else {
          // Create new profile
          await createProfile(userId, email, userRole);
          console.log(`Created new profile with role ${userRole}`);
        }
      } catch (error) {
        console.error('Error ensuring profile has role:', error);
      }
    };
    
    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setRole(null)
          return
        }
        
        fetchUserRole()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, redirecting, lastRedirectTime])

  return { 
    role, 
    loading, 
    isAdmin: role === 'admin',
    isManager: role === 'manager', 
    isAgent: role === 'agent' 
  }
} 