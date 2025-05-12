'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ManagerSidebar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/manager/dashboard', label: 'Dashboard' },
    { href: '/manager/agents', label: 'My Agents' },
    { href: '/manager/applications', label: 'All Applications' },
    { href: '/manager/my-applications', label: 'My Applications' },
    { href: '/manager/carriers', label: 'Carriers' },
    { href: '/manager/analytics', label: 'Analytics' },
    { href: '/manager/calendar', label: 'Calendar' },
    { href: '/manager/ai-chat', label: 'AI Chat' },
    { href: '/manager/script-assistant', label: 'Script Assistant' },
    { href: '/manager/settings', label: 'Settings' },
  ];

  return (
    <aside className="bg-blue-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Manager Portal</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {links.map((link) => (
            <li key={link.href} className="mb-2">
              <Link
                href={link.href}
                className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${
                  pathname === link.href ? 'bg-blue-700 font-medium' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 