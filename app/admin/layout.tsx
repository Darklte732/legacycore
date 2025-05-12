'use client';

import { ReactNode } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { redirect } from 'next/navigation';
import { useRole } from '@/hooks/useRole';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useRole();
  
  // If still loading, show a minimal loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect away if not an admin
  if (role !== 'admin') {
    redirect('/login');
    return null;
  }
  
  // Return the page content - RoleBasedLayout will handle the sidebar
  return (
    <RoleBasedLayout>
      <div className="p-6">
        {children}
      </div>
    </RoleBasedLayout>
  );
} 