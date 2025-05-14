'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface RoleBasedLayoutProps {
  children: ReactNode;
  role?: 'admin' | 'agent' | 'manager';
  title?: string;
}

export function RoleBasedLayout({ 
  children, 
  role = 'agent', 
  title = 'Dashboard'
}: RoleBasedLayoutProps) {
  const pathname = usePathname();
  
  const renderNavLinks = () => {
    switch(role) {
      case 'admin':
        return (
          <>
            <NavLink href="/admin/dashboard" active={pathname === '/admin/dashboard'}>Dashboard</NavLink>
            <NavLink href="/admin/agents" active={pathname === '/admin/agents'}>Agents</NavLink>
            <NavLink href="/admin/applications" active={pathname === '/admin/applications'}>Applications</NavLink>
            <NavLink href="/admin/carriers" active={pathname === '/admin/carriers'}>Carriers</NavLink>
            <NavLink href="/admin/analytics" active={pathname === '/admin/analytics'}>Analytics</NavLink>
            <NavLink href="/admin/settings" active={pathname === '/admin/settings'}>Settings</NavLink>
          </>
        );
      case 'manager':
        return (
          <>
            <NavLink href="/manager/dashboard" active={pathname === '/manager/dashboard'}>Dashboard</NavLink>
            <NavLink href="/manager/agents" active={pathname === '/manager/agents'}>Agents</NavLink>
            <NavLink href="/manager/applications" active={pathname === '/manager/applications'}>Applications</NavLink>
            <NavLink href="/manager/my-applications" active={pathname === '/manager/my-applications'}>My Applications</NavLink>
            <NavLink href="/manager/carriers" active={pathname === '/manager/carriers'}>Carriers</NavLink>
            <NavLink href="/manager/analytics" active={pathname === '/manager/analytics'}>Analytics</NavLink>
            <NavLink href="/manager/settings" active={pathname === '/manager/settings'}>Settings</NavLink>
          </>
        );
      case 'agent':
      default:
        return (
          <>
            <NavLink href="/agent/dashboard" active={pathname === '/agent/dashboard'}>Dashboard</NavLink>
            <NavLink href="/agent/applications" active={pathname === '/agent/applications'}>Applications</NavLink>
            <NavLink href="/agent/leads" active={pathname === '/agent/leads'}>Leads</NavLink>
            <NavLink href="/agent/commissions" active={pathname === '/agent/commissions'}>Commissions</NavLink>
            <NavLink href="/agent/carriers" active={pathname === '/agent/carriers'}>Carriers</NavLink>
            <NavLink href="/agent/calendar" active={pathname === '/agent/calendar'}>Calendar</NavLink>
            <NavLink href="/agent/settings" active={pathname === '/agent/settings'}>Settings</NavLink>
          </>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Legacy Core
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {renderNavLinks()}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div>
                  <button 
                    type="button" 
                    className="flex text-sm rounded-full focus:outline-none"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {role.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {title}
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        active
          ? 'border-indigo-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

export default RoleBasedLayout; 