import { useState, useEffect } from 'react';
import useAuth from './useAuth';

// Define role types
export type UserRole = 'admin' | 'agent' | 'manager' | 'user' | null;

export default function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [user, authLoading]);

  return { role, loading };
} 