import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Users, Settings, LogOut, Layers, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const AdminSidebar = () => {
  const pathname = usePathname()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  // Clear problematic cookies on every render to prevent double UI
  useEffect(() => {
    // Always clear these cookies when AdminSidebar renders
    document.cookie = "force_manager_view=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "test_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin_redirected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Remove any duplicate sidebars that might exist
    const removeDuplicateSidebars = () => {
      // Try to remove duplicate sidebars
      const sidebars = document.querySelectorAll('.w-64.bg-gray-900');
      if (sidebars.length > 1) {
        console.log('AdminSidebar: Found multiple sidebars, removing duplicates');
        // Remove all but the first one
        for (let i = 1; i < sidebars.length; i++) {
          sidebars[i].remove();
        }
      }

      // Also remove any manager sidebar that might be present
      const managerSidebarIndicators = document.querySelectorAll('.text-xl.font-bold');
      managerSidebarIndicators.forEach(el => {
        if (el.textContent?.includes('LegacyCore Manager')) {
          // Find parent sidebar and remove it
          let parent = el.parentElement;
          while (parent && !parent.classList.contains('w-64')) {
            parent = parent.parentElement;
          }
          if (parent) {
            parent.remove();
            console.log('AdminSidebar: Removed manager sidebar');
          }
        }
      });
    };
    
    // Run cleanup immediately and after a slight delay to catch late renders
    removeDuplicateSidebars();
    setTimeout(removeDuplicateSidebars, 100);
    setTimeout(removeDuplicateSidebars, 500);
  }, []);

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

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen" id="admin-sidebar">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">LegacyCore Admin</h1>
      </div>

      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                isActive('/admin/dashboard')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/views/user-management"
              className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                isActive('/admin/views/user-management')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/views"
              className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                isActive('/admin/views')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>Role Views</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-md ${
                isActive('/admin/settings')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        {(userEmail || userId) && (
          <div className="px-4 py-2 mb-2 text-sm border-b border-slate-700 pb-2">
            {userEmail && (
              <div className="flex items-center space-x-3 text-slate-400 mb-1">
                <User className="h-4 w-4" />
                <span className="truncate">{userEmail}</span>
              </div>
            )}
            {userId && (
              <div className="text-xs text-slate-500 mt-1 pl-7">
                <span>ID: {userId}</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
} 