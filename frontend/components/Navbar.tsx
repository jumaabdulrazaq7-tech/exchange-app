'use client';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { getUser } from '@/lib/api';

const titles: Record<string, string> = {
  '/dashboard': 'Dashibodi',
  '/transactions': 'Miamala',
  '/customers': 'Wateja',
  '/expenses': 'Gharama',
  '/loans': 'Madeni & Mikopo',
  '/reports': 'Ripoti',
  '/settings': 'Mipangilio',
};

export default function Navbar() {
  const pathname = usePathname();
  const user = getUser();
  const today = new Date().toLocaleDateString('sw-TZ', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-30 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{titles[pathname] || 'Dirham Exchange'}</h1>
        <p className="text-xs text-gray-400">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
