"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Define role types
export type UserRole = 'admin' | 'agent' | 'manager' | 'user' | null;

// Type for the hook return value
export type UseRoleReturn = {
  role: UserRole;
  loading: boolean;
};

// Static return value for SSR
const staticRoleValue: UseRoleReturn = {
  role: null, // Changed from 'admin' to null for consistent hydration
  loading: true // Always return loading=true for server rendered content
};

// Determine if we're running in a server context
const isServer = typeof window === 'undefined';

export function useRole(): UseRoleReturn {
  // If running in a server context during build, return a static value
  if (isServer) {
    return staticRoleValue;
  }

  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Skip on first render to prevent hydration mismatch
    
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Check for role in user metadata
    const userRole = user.app_metadata?.role || user.user_metadata?.role;
    
    if (userRole) {
      setRole(userRole as UserRole);
    } else {
      // Default to 'user' if no role is found
      setRole('user');
    }
    
    setLoading(false);
  }, [user, authLoading, mounted]);

  // If not mounted yet, return the same state that was rendered on the server
  if (!mounted) {
    return staticRoleValue;
  }

  return { role, loading };
}

// Export as default and named export for flexibility
export default useRole; 