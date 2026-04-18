'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Users, Receipt, CreditCard, BarChart3, Settings, LogOut, TrendingUp } from 'lucide-react';
import { getUser } from '@/lib/api';

const nav = [
  { href: '/dashboard', label: 'Dashibodi', icon: LayoutDashboard },
  { href: '/transactions', label: 'Miamala', icon: ArrowLeftRight },
  { href: '/customers', label: 'Wateja', icon: Users },
  { href: '/expenses', label: 'Gharama', icon: Receipt },
  { href: '/loans', label: 'Madeni & Mikopo', icon: CreditCard },
  { href: '/reports', label: 'Ripoti', icon: BarChart3 },
  { href: '/settings', label: 'Mipangilio', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-xl">💱</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Dirham Exchange</h1>
            <p className="text-xs text-gray-400">Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={"flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 " + (active ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-primary-50 hover:text-primary')}>
              <Icon size={18} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-primary-50 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Mtumiaji'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.businessName || ''}</p>
            </div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={16} />
          Toka
        </button>
      </div>
    </aside>
  );
}