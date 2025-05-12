'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/agents', label: 'Agents' },
    { href: '/admin/applications', label: 'Applications' },
    { href: '/admin/carriers', label: 'Carriers' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {links.map((link) => (
            <li key={link.href} className="mb-2">
              <Link
                href={link.href}
                className={`block px-4 py-2 hover:bg-gray-700 transition-colors ${
                  pathname === link.href ? 'bg-gray-700 font-medium' : ''
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