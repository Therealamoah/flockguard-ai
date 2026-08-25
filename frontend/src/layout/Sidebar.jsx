import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Bird,
  ClipboardList,
  HeartPulse,
  Bell,
  BarChart3,
  Lightbulb,
  FileText,
  Settings,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useFarmData } from '../context/farmDataStore';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/flocks', label: 'My flocks', icon: Bird },
  { to: '/daily-records', label: 'Daily records', icon: ClipboardList },
  { to: '/health-monitoring', label: 'Health monitoring', icon: HeartPulse },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { pendingVerification } = useFarmData();
  const alertsBadge = pendingVerification.length || undefined;

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col bg-brand-950 text-white/80">
      <div className="px-6 pt-6 pb-4">
        <span className="text-lg font-semibold tracking-tight text-white">FlockGuard</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
          const badge = to === '/alerts' ? alertsBadge : undefined;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-800 text-white'
                    : 'text-white/65 hover:bg-brand-900 hover:text-white'
                )
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {label}
              </span>
              {badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {currentUser.initials}
          </span>
          <span className="text-sm font-medium text-white/90">{currentUser.name}</span>
        </div>
      </div>
    </aside>
  );
}
