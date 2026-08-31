import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/FormField';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Clicking the emailed link lands here with a recovery token in the
    // URL; supabase-js reads it automatically and fires this event once
    // it's turned that into a real (temporary) session.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready) {
    return (
      <>
        <h1 className="text-xl font-semibold text-ink">Checking your link…</h1>
        <p className="mt-1 text-sm text-ink-soft">
          If this doesn't update in a moment, the link may have expired — request a new one from the forgot
          password page.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-ink-soft">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="New password">
          <input
            required
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            required
            type="password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>

        {error && <p className="text-xs font-medium text-critical-ink">{error}</p>}

        <button
          type="submit"
          className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Update password
        </button>
      </form>
    </>
  );
}
