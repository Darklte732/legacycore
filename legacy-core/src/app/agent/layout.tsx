'use client'

import { ReactNode, useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { redirect } from 'next/navigation'
import { useRole } from '@/hooks/useRole'

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useRole()
  
  // Debug layout rendering
  useEffect(() => {
    console.log('AgentLayout: Current role =', role)
    console.log('AgentLayout: Loading state =', loading)
  }, [role, loading])
  
  // If still loading, show a minimal loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Redirect away if not an agent (or an admin/manager who can see agent UI)
  if (role !== 'agent' && role !== 'admin' && role !== 'manager') {
    console.log('AgentLayout: Unauthorized role, redirecting to login')
    redirect('/login')
    return null
  }
  
  // Return the page content - RoleBasedLayout will handle the sidebar
  return (
    <RoleBasedLayout>
      <div className="h-full">
        {children}
      </div>
    </RoleBasedLayout>
  )
} 