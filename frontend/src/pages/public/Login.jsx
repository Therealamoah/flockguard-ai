import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/FormField';
import { useAuth } from '../../context/authStore';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    await login({ email, password });
    navigate(location.state?.from?.pathname ?? '/app', { replace: true });
  } catch (err) {
    alert(err.message);
  }
}


  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Log in to FlockGuard</h1>
      <p className="mt-1 text-sm text-ink-soft">Monitor your flocks and catch problems early.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Email">
          <input
            required
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@farm.com"
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

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-brand-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-500 hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
