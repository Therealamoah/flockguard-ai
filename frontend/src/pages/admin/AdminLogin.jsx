import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import FormField, { inputClass } from '../../components/FormField';
import { useAdminAuth } from '../../context/adminAuthStore';

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await adminLogin({ email, password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-950 px-4">
      <div className="mb-8 flex items-center gap-2 text-white">
        <ShieldCheck size={20} />
        <span className="text-lg font-semibold tracking-tight">FlockGuard Admin</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card px-7 py-8 shadow-xl">
        <h1 className="text-xl font-semibold text-ink">Internal sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Restricted to FlockGuard staff.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FormField label="Work email">
            <input
              required
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@flockguard.io"
            />
          </FormField>
          <FormField label="Password">
            <input
              required
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          {error && <p className="text-xs font-medium text-critical-ink">{error}</p>}

          <button
            type="submit"
            className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
