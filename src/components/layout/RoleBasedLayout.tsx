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
  const [pathBasedSidebar, setPathBasedSidebar] = useState<React.ReactNode | null>(null)
  
  // Debug
  useEffect(() => {
    console.log('RoleBasedLayout: Current role =', role)
    console.log('RoleBasedLayout: Current path =', pathname)
  }, [role, pathname])
  
  // Immediately determine sidebar based on path to prevent flashing
  useEffect(() => {
    if (!pathname) return;
    
    // Determine sidebar based on the path, regardless of role
    if (pathname.startsWith('/agent')) {
      setPathBasedSidebar(<AgentSidebar />)
    } else if (pathname.startsWith('/manager')) {
      setPathBasedSidebar(<ManagerSidebar />)
    } else if (pathname.startsWith('/admin')) {
      setPathBasedSidebar(<AdminSidebar />)
    } else {
      setPathBasedSidebar(null)
    }
  }, [pathname])
  
  useEffect(() => {
    // Remove loading indicator after 2 seconds to avoid stuck loaders
    const timer = setTimeout(() => {
      setLoadingIndicator(false)
      setShowUI(true) // Always show UI after timeout, even if role is still loading
      
      // Clean up any stuck loading indicators
      const loadingElements = document.querySelectorAll('.loading-indicator')
      if (loadingElements.length > 0) {
        console.log('RoleBasedLayout: Found loading indicators that might be stuck, removing them')
        loadingElements.forEach(el => el.remove())
      }
    }, 1000) // Reduced to 1 second
    
    return () => clearTimeout(timer)
  }, [])
  
  // Handle showing UI - less aggressive hiding
  useEffect(() => {
    if (!loading && role) {
      setShowUI(true)
    }
  }, [loading, role])
  
  // Handle redirections based on role
  useEffect(() => {
    if (!role || !pathname || loading) return
    
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
    handleRoleRedirection()
  }, [role, pathname, router, loading])
  
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
  
  // Render the appropriate sidebar based on priority:
  // 1. Path-based sidebar (highest priority)
  // 2. Role-based sidebar (fallback)
  const renderSidebar = () => {
    // If we've determined a sidebar based on path, use that (highest priority)
    if (pathBasedSidebar) {
      return pathBasedSidebar;
    }
    
    // If still loading, show no sidebar
    if (loading) {
      console.log('RoleBasedLayout: Still loading, not showing sidebar yet')
      return null
    }
    
    // Fallback to role-based sidebar
    if (role === 'admin') {
      return <AdminSidebar />
    } else if (role === 'manager') {
      return <ManagerSidebar />
    } else if (role === 'agent') {
      return <AgentSidebar />
    }
    
    console.log('RoleBasedLayout: No matching sidebar for role:', role)
    return null
  }
  
  return (
    <div className="flex flex-row min-h-screen bg-gray-100 w-full overflow-hidden">
      {renderSidebar()}
      
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