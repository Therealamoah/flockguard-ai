import { Link } from 'react-router-dom';
import { useAuth } from '../context/authStore';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <span className="text-sm font-medium text-brand-500">404</span>
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to={isAuthenticated ? '/app' : '/'}
        className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        {isAuthenticated ? 'Back to dashboard' : 'Back home'}
      </Link>
    </div>
  );
}
