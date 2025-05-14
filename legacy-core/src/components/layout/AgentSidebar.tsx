import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FileText, DollarSign, Building2, LogOut, PlusCircle, 
  MessageSquare, Bot, Paperclip, User, Calendar, Bell, Mail, 
  AlertTriangle, RefreshCw, FileImage, Inbox
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export const AgentSidebar: React.FC = () => {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '/agent/attachments': true
  });
  const supabase = createClient()
  
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

  const isActive = (path: string) => pathname?.startsWith(path);
  
  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const mainNavItems = [
    { 
      href: '/agent/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    {
      href: '/agent/script-assistant',
      label: 'Script Assistant',
      icon: <MessageSquare className="h-5 w-5" />
    },
    { 
      href: '/agent/applications', 
      label: 'My Applications', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      href: '/agent/commissions', 
      label: 'Commissions', 
      icon: <DollarSign className="h-5 w-5" /> 
    },
    { 
      href: '/agent/carriers', 
      label: 'Carriers', 
      icon: <Building2 className="h-5 w-5" /> 
    },
    { 
      href: '/agent/calendar', 
      label: 'Calendar', 
      icon: <Calendar className="h-5 w-5" /> 
    }
  ];
  
  const attachmentsItem = {
    href: '/agent/attachments',
    label: 'Attachments',
    icon: <Paperclip className="h-5 w-5" />,
    subItems: [
      {
        href: '/agent/attachments?type=email',
        label: 'Email Processing',
        icon: <Mail className="h-4 w-4" />
      },
      {
        href: '/agent/attachments?type=drafts',
        label: 'Draft Returns',
        icon: <RefreshCw className="h-4 w-4" />
      },
      {
        href: '/agent/attachments?type=notifications',
        label: 'Notifications',
        icon: <Bell className="h-4 w-4" />
      },
      {
        href: '/agent/attachments?type=documents',
        label: 'Documents',
        icon: <FileImage className="h-4 w-4" />
      }
    ]
  };

  const bottomNavItems = [
    { 
      href: '/agent/ai-chat', 
      label: 'AI Chat', 
      icon: <Bot className="h-5 w-5" /> 
    },
    { 
      href: '/agent/applications/new', 
      label: 'New Application', 
      icon: <PlusCircle className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 flex flex-col min-h-screen h-full sticky top-0 left-0 shadow-lg">
      <div className="mb-6 pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <Image 
              src="/logo.png" 
              alt="LegacyCore Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-400">
            LegacyCore Agent
          </h1>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        {/* Main navigation items */}
        <div className="pb-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 p-2 rounded-md w-full text-left mb-1 transition-colors ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-800/60 to-blue-900/40 text-blue-200'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <div className={`${isActive(item.href) ? 'text-blue-400' : 'text-gray-400'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        {/* Attachments with sub-items */}
        <div className="pb-2 border-t border-b border-gray-800 my-2 pt-2">
          <button
            onClick={() => toggleExpand(attachmentsItem.href)}
            className={`flex items-center justify-between space-x-2 p-2 rounded-md w-full text-left mb-1 transition-colors ${
              isActive(attachmentsItem.href)
                ? 'bg-gradient-to-r from-blue-800/60 to-blue-900/40 text-blue-200'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`${isActive(attachmentsItem.href) ? 'text-blue-400' : 'text-gray-400'}`}>
                {attachmentsItem.icon}
              </div>
              <span>{attachmentsItem.label}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${expandedItems[attachmentsItem.href] ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedItems[attachmentsItem.href] && (
            <div className="ml-8 space-y-1 mt-1">
              {attachmentsItem.subItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center space-x-2 p-1.5 rounded-md w-full text-left text-sm transition-colors ${
                    isActive(subItem.href) && pathname?.includes(new URL(subItem.href, 'http://example.com').search)
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`${
                    isActive(subItem.href) && pathname?.includes(new URL(subItem.href, 'http://example.com').search)
                      ? 'text-blue-400'
                      : 'text-gray-500'
                  }`}>
                    {subItem.icon}
                  </div>
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Bottom navigation items */}
        <div className="pb-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 p-2 rounded-md w-full text-left mb-1 transition-colors ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-800/60 to-blue-900/40 text-blue-200'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <div className={`${isActive(item.href) ? 'text-blue-400' : 'text-gray-400'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Spacer to push footer to bottom */}
      <div className="flex-grow"></div>
      
      {(userEmail || userId) && (
        <div className="p-3 mb-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-full">
              <User className="h-4 w-4 text-blue-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-0.5">Logged in as:</span>
              <span className="text-xs text-gray-200 break-all leading-snug font-medium">
                {userEmail}
              </span>
              {userId && (
                <span className="text-xs text-gray-400 break-all leading-snug mt-1 bg-gray-900/50 p-1.5 rounded border border-gray-800 mt-2 font-mono">
                  ID: {userId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => signOut()}
        className="flex items-center justify-center space-x-2 p-2 rounded-md bg-gradient-to-r from-gray-800 to-gray-700 hover:from-red-900 hover:to-red-800 text-gray-300 hover:text-white w-full text-center transition-colors duration-300"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  )
} 