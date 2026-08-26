import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-surface px-4 py-10">
      <Link to="/" className="mb-8 text-lg font-semibold tracking-tight text-ink">
        FlockGuard
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card px-7 py-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
