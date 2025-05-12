'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AgentSidebar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/agent/dashboard', label: 'Dashboard' },
    { href: '/agent/applications', label: 'Applications' },
    { href: '/agent/carriers', label: 'Carriers' },
    { href: '/agent/commissions', label: 'Commissions' },
    { href: '/agent/calendar', label: 'Calendar' },
    { href: '/agent/attachments', label: 'Attachments' },
    { href: '/agent/ai-chat', label: 'AI Chat' },
    { href: '/agent/script-assistant', label: 'Script Assistant' },
    { href: '/agent/settings', label: 'Settings' },
  ];

  return (
    <aside className="bg-indigo-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Agent Portal</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {links.map((link) => (
            <li key={link.href} className="mb-2">
              <Link
                href={link.href}
                className={`block px-4 py-2 hover:bg-indigo-700 transition-colors ${
                  pathname === link.href ? 'bg-indigo-700 font-medium' : ''
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