import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
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
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      const result = await register(form);
      if (result?.confirmationRequired) {
        setConfirmationRequired(true);
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (confirmationRequired) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mint-100 text-brand-500">
          <MailCheck size={20} />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">Check your email</h1>
        <p className="mt-1 text-sm text-ink-soft">
          We sent a confirmation link to <span className="font-medium text-ink">{form.email}</span>. Confirm your
          address to finish setting up your account.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-brand-500 hover:underline">
          Back to log in
        </Link>
      </div>
    );
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
