import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import FormField, { inputClass } from '../../components/FormField';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mint-100 text-brand-500">
          <MailCheck size={20} />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">Check your email</h1>
        <p className="mt-1 text-sm text-ink-soft">
          If an account exists for <span className="font-medium text-ink">{email}</span>, a reset link is on its way.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-brand-500 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-soft">Enter your email and we'll send you a reset link.</p>

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

        <button
          type="submit"
          className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-medium text-brand-500 hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
