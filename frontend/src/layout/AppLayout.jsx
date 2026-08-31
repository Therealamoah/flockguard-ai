import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { useFarmData } from '../context/farmDataStore';

export default function AppLayout() {
  const { loading } = useFarmData();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-8 py-8">
          {loading ? (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-ink-muted">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading your farm…</span>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}
