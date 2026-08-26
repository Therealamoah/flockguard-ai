import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/FormField';
import { useAuth } from '../../context/authStore';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    farmName: '',
    managerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    register(form);
    navigate('/app', { replace: true });
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Create your farm account</h1>
      <p className="mt-1 text-sm text-ink-soft">Start catching flock health issues before they spread.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Farm name">
          <input
            required
            className={inputClass}
            value={form.farmName}
            onChange={(e) => update('farmName', e.target.value)}
            placeholder="Colnett Poultry Farm"
          />
        </FormField>
        <FormField label="Your name">
          <input
            required
            className={inputClass}
            value={form.managerName}
            onChange={(e) => update('managerName', e.target.value)}
            placeholder="Collins Amoah"
          />
        </FormField>
        <FormField label="Email">
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@farm.com"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Password">
            <input
              required
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </FormField>
          <FormField label="Confirm">
            <input
              required
              type="password"
              className={inputClass}
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
          </FormField>
        </div>

        {error && <p className="text-xs font-medium text-critical-ink">{error}</p>}

        <button
          type="submit"
          className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-500 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
