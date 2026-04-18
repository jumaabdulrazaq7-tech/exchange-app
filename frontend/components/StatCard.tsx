import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  trend?: { value: string; up: boolean };
}

const colors = {
  blue: { bg: 'bg-primary-50', icon: 'bg-primary text-white', text: 'text-primary' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-500 text-white', text: 'text-emerald-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-500 text-white', text: 'text-red-600' },
  yellow: { bg: 'bg-amber-50', icon: 'bg-amber-500 text-white', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500 text-white', text: 'text-purple-600' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }: StatCardProps) {
  const c = colors[color];
  return (
    <div className={"card hover:shadow-md transition-all duration-200 " + c.bg}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={"text-2xl font-bold mt-1.5 " + c.text}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={"flex items-center gap-1 mt-2 text-xs font-medium " + (trend.up ? 'text-emerald-600' : 'text-red-500')}>
              <span>{trend.up ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={"w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm " + c.icon}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}