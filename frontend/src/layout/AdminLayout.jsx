import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/adminAuthStore';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/farms', label: 'Farms' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/billing', label: 'Billing' },
  { to: '/admin/activity', label: 'Activity' },
];

export default function AdminLayout() {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    adminLogout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-brand-950">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck size={18} />
            <span className="text-base font-semibold tracking-tight">FlockGuard Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {admin.initials}
            </span>
            <span className="text-sm text-white/80">{admin.name}</span>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-brand-900 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1180px] gap-1 px-6">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                clsx(
                  'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
