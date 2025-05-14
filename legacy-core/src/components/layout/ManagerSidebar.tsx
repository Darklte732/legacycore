import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FileText, Users, Building2, Settings, 
  BarChart2, LogOut, Calendar, PenSquare, MessageSquare, ClipboardList,
  Bell, Activity, ChevronRight, Home
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export const ManagerSidebar: React.FC = () => {
  const pathname = usePathname()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  
  // Validate we should be showing manager sidebar and not admin sidebar
  useEffect(() => {
    // Fix for double UI: Skip rendering manager sidebar on admin paths entirely
    if (pathname?.startsWith('/admin')) {
      console.log('ManagerSidebar: Prevented rendering on admin path');
      return;
    }
    
    // Remove any duplicate sidebars that might exist
    const removeDuplicateSidebars = () => {
      // Try to remove duplicate sidebars
      const sidebars = document.querySelectorAll('.w-64.bg-gray-900');
      if (sidebars.length > 1) {
        console.log('ManagerSidebar: Found multiple sidebars, removing duplicates');
        // Keep only the current manager sidebar
        sidebars.forEach(el => {
          const headingEl = el.querySelector('.text-xl.font-bold');
          if (headingEl && !headingEl.textContent?.includes('LegacyCore Manager')) {
            el.remove();
          }
        });
      }

      // Also remove any admin sidebar that might be present
      const adminSidebarIndicators = document.querySelectorAll('.text-xl.font-bold');
      adminSidebarIndicators.forEach(el => {
        if (el.textContent?.includes('LegacyCore Admin')) {
          // Find parent sidebar and remove it
          let parent = el.parentElement;
          while (parent && !parent.classList.contains('w-64')) {
            parent = parent.parentElement;
          }
          if (parent) {
            parent.remove();
            console.log('ManagerSidebar: Removed admin sidebar');
          }
        }
      });
    };
    
    // Set correct role cookies if on manager pages
    if (pathname?.startsWith('/manager')) {
      // Ensure test_role is set to manager
      if (!document.cookie.includes('test_role=manager')) {
        document.cookie = "test_role=manager; path=/; max-age=86400";
      }
    }
    
    // Run cleanup immediately and after a slight delay to catch late renders
    removeDuplicateSidebars();
    setTimeout(removeDuplicateSidebars, 100);
    setTimeout(removeDuplicateSidebars, 500);
  }, [pathname]);
  
  // Get current user email and ID
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || '');
        setUserId(session.user.id || '');
      }
    };
    
    getUserInfo();
  }, [supabase]);
  
  // Fix for double UI: Skip rendering manager sidebar on admin paths entirely
  if (pathname?.startsWith('/admin')) {
    console.log('ManagerSidebar: Prevented rendering on admin path to avoid double UI');
    return null;
  }
  
  const isActive = (path: string) => {
    if (!pathname) return false;
    
    // More exact matching to avoid partial path matches
    return pathname === path || 
           pathname === path + '/' || 
           (pathname.startsWith(path + '/') && path !== '/manager');
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Manager sidebar: initiating logout...')
    try {
      await supabase.auth.signOut()
      console.log('Manager sidebar: signOut completed, redirecting...')
      
      // Force a browser redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Manager sidebar: logout error:', error)
      // Still try to redirect to login on error
      window.location.href = '/login'
    }
  }

  // Define navigation items
  const navItems = [
    { 
      href: '/manager/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      href: '/manager/agents', 
      label: 'Agents', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      href: '/manager/my-applications', 
      label: 'My Applications', 
      icon: <ClipboardList className="h-5 w-5" /> 
    },
    { 
      href: '/manager/applications', 
      label: 'All Applications', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      href: '/manager/carriers', 
      label: 'Carriers', 
      icon: <Building2 className="h-5 w-5" /> 
    },
    { 
      href: '/manager/calendar', 
      label: 'Calendar', 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      href: '/manager/analytics', 
      label: 'Analytics', 
      icon: <BarChart2 className="h-5 w-5" /> 
    },
    { 
      href: '/manager/ai-chat', 
      label: 'AI Chat', 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      href: '/manager/script-assistant', 
      label: 'Script Assistant', 
      icon: <PenSquare className="h-5 w-5" /> 
    },
    { 
      href: '/manager/settings', 
      label: 'Settings', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ]

  // Handle direct navigation without any client-side routing
  const handleNavigation = (href: string) => {
    console.log(`Navigating to: ${href}`);
    
    // Use direct location change with absolute URL to ensure proper navigation
    const absoluteUrl = new URL(href, window.location.origin).toString();
    
    // Add timestamp parameter to prevent caching
    const url = new URL(absoluteUrl);
    url.searchParams.set('nocache', Date.now().toString());
    
    // Force a complete page reload
    window.location.href = url.toString();
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex flex-col min-h-screen h-screen sticky top-0 left-0 shadow-lg" id="manager-sidebar">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 mr-3 relative flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="LegacyCore Logo" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-white">LegacyCore Manager</h1>
        </div>
        <div className="h-1 w-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={`flex items-center space-x-3 p-2.5 rounded-lg w-full text-left transition-all duration-200 ${
              isActive(item.href) 
                ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Spacer to push footer to bottom */}
      <div className="flex-grow"></div>
      
      {/* User Profile Section */}
      {userEmail && (
        <div className="mt-4 py-3 border-t border-gray-700/50">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <button 
                onClick={handleLogout}
                className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 