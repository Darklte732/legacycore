'use client';

import { ReactNode } from 'react';
import useRole from '@/hooks/useRole';
import AdminSidebar from './AdminSidebar';
import AgentSidebar from './AgentSidebar';
import ManagerSidebar from './ManagerSidebar';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { role, loading } = useRole();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar based on role */}
      {role === 'admin' && <AdminSidebar />}
      {role === 'agent' && <AgentSidebar />}
      {role === 'manager' && <ManagerSidebar />}
      
      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
} 