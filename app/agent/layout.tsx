'use client'

import { ReactNode, useEffect, useState } from 'react'
import RoleBasedLayout from '@/components/layout/RoleBasedLayout'
import { redirect } from 'next/navigation'
import useRole from '@/hooks/useRole'

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useRole()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)
  
  // Mark when component is mounted client-side
  useEffect(() => {
    setIsClientSide(true)
    
    // Only log in client-side environment
    if (typeof window !== 'undefined') {
      console.log('AgentLayout: Current role =', role)
      console.log('AgentLayout: Loading state =', loading)
    }
  }, [role, loading])
  
  // Handle client-side redirect to prevent hydration issues
  useEffect(() => {
    // Only check role after initial loading is complete
    if (!loading && role !== 'agent' && role !== 'admin' && role !== 'manager') {
      console.log('AgentLayout: Unauthorized role, redirecting to login')
      setIsRedirecting(true)
      window.location.href = '/login'
    }
  }, [role, loading])
  
  // Always show loading state on server and initial client render
  if (loading || !isClientSide || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
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