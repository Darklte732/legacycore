import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { AdminSidebar } from './AdminSidebar'
import { ManagerSidebar } from './ManagerSidebar'
import { AgentSidebar } from './AgentSidebar'
import { UserRole } from '@/types/roles'

interface RoleBasedLayoutProps {
  children: React.ReactNode
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const { role, loading } = useRole()
  const pathname = usePathname()
  const router = useRouter()
  const [showUI, setShowUI] = useState(true)
  const [loadingIndicator, setLoadingIndicator] = useState(true)
  
  // Debug
  useEffect(() => {
    console.log('RoleBasedLayout: Current role =', role)
    console.log('RoleBasedLayout: Current path =', pathname)
  }, [role, pathname])
  
  useEffect(() => {
    // Remove loading indicator after 2 seconds to avoid stuck loaders
    const timer = setTimeout(() => {
      setLoadingIndicator(false)
      
      // Clean up any stuck loading indicators
      const loadingElements = document.querySelectorAll('.loading-indicator')
      if (loadingElements.length > 0) {
        console.log('RoleBasedLayout: Found loading indicators that might be stuck, removing them')
        loadingElements.forEach(el => el.remove())
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    // Only hide the UI when explicitly needed to prevent flash
    if (loading) {
      setShowUI(false)
    } else {
      setShowUI(true)
    }
  }, [loading])
  
  useEffect(() => {
    if (!role || !pathname) return
    
    // Determine the current section based on pathname
    const isAdminPath = pathname.startsWith('/admin')
    const isManagerPath = pathname.startsWith('/manager')
    const isAgentPath = pathname.startsWith('/agent')
    
    // Handle role-based redirection
    const handleRoleRedirection = () => {
      // If they're on the wrong path, redirect to the appropriate path
      if (role === 'admin' && !isAdminPath) {
        router.push('/admin/dashboard')
        return
      }
      
      if (role === 'manager' && !isManagerPath) {
        if (isAdminPath) {
          console.log('⚠️ Path mismatch: User with role manager on admin path. Redirecting...')
        }
        router.push('/manager/dashboard')
        return
      }
      
      if (role === 'agent' && !isAgentPath) {
        if (isAdminPath || isManagerPath) {
          console.log('⚠️ Path mismatch: User with role agent on admin/manager path. Redirecting...')
        }
        router.push('/agent/dashboard')
        return
      }
    }
    
    // Only redirect if we are confident about the role and path
    if (role && pathname) {
      handleRoleRedirection()
    }
  }, [role, pathname, router])
  
  // Function to determine which sidebar to show based on role and pathname
  const getSidebarComponent = () => {
    // If no role or loading, don't show any sidebar
    if (loading) {
      console.log('RoleBasedLayout: Still loading, not showing sidebar yet')
      return null
    }
    
    // KEY CHANGE: On specific paths, show the matching sidebar
    // This ensures path-specific UIs are correct, even if role is wrong
    if (pathname) {
      // On agent paths, show the agent sidebar
      if (pathname.startsWith('/agent')) {
        console.log('RoleBasedLayout: On agent path, showing AgentSidebar')
        return <AgentSidebar />
      }
      
      // On manager paths, show the manager sidebar
      if (pathname.startsWith('/manager')) {
        console.log('RoleBasedLayout: On manager path, showing ManagerSidebar')
        return <ManagerSidebar />
      }
      
      // On admin paths, show the admin sidebar
      if (pathname.startsWith('/admin')) {
        console.log('RoleBasedLayout: On admin path, showing AdminSidebar')
        return <AdminSidebar />
      }
    }
    
    // Fallback to role-based sidebar if not on a specific path
    if (role === 'admin') {
      console.log('RoleBasedLayout: Using role-based AdminSidebar')
      return <AdminSidebar />
    }
    
    if (role === 'manager') {
      console.log('RoleBasedLayout: Using role-based ManagerSidebar')
      return <ManagerSidebar />
    }
    
    if (role === 'agent') {
      console.log('RoleBasedLayout: Using role-based AgentSidebar')
      return <AgentSidebar />
    }
    
    console.log('RoleBasedLayout: No matching sidebar for role:', role)
    return null
  }
  
  // Clear problematic cookies on component mount
  useEffect(() => {
    // For agent paths, ensure we're not showing the wrong sidebar due to cookies
    if (pathname?.startsWith('/agent')) {
      const testRoleCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('test_role='))
        ?.split('=')[1];
      
      if (testRoleCookie && testRoleCookie !== 'agent') {
        console.log(`Detected conflicting test_role=${testRoleCookie} cookie on agent path, clearing it`)
        document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
  }, [pathname]);
  
  return (
    <div className="flex flex-row min-h-screen bg-gray-100 w-full overflow-hidden">
      {/* Always attempt to render the sidebar component */}
      {getSidebarComponent()}
      
      <div className="flex-1 overflow-hidden min-h-screen h-screen max-h-screen">
        {loadingIndicator && !showUI ? (
          <div className="loading-indicator flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          showUI && (
            <main className="p-4 h-full overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          )
        )}
      </div>
    </div>
  )
} 