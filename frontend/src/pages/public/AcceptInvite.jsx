import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormField, { inputClass } from '../../components/FormField';
import { publicApi } from '../../lib/backendApi';
import { supabase } from '../../lib/supabaseClient';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoadError('This invite link is missing its token.');
        return;
      }
      try {
        setInvite(await publicApi.get(`/api/team/invite/${token}`));
      } catch (err) {
        setLoadError(err.message);
      }
    }
    load();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await publicApi.post('/api/team/accept-invite', { token, name, password });
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: invite.email, password });
      if (loginError) throw loginError;
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <>
        <h1 className="text-xl font-semibold text-ink">Invite not available</h1>
        <p className="mt-1 text-sm text-ink-soft">{loadError}</p>
      </>
    );
  }

  if (!invite) {
    return <p className="text-sm text-ink-soft">Loading your invite…</p>;
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Join {invite.farmName}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        You've been invited as a <span className="font-medium text-ink">{invite.role}</span>. Set up your account
        to get started.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Email">
          <input className={inputClass} value={invite.email} disabled />
        </FormField>
        <FormField label="Your name">
          <input
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ama Boateng"
          />
        </FormField>
        <FormField label="Password">
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
          disabled={submitting}
          className="mt-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? 'Joining…' : 'Join the team'}
        </button>
      </form>
    </>
  );
}
