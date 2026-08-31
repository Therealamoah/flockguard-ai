import { useEffect, useState } from 'react';
import { UserPlus, Lock, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PlanPickerModal from '../components/PlanPickerModal';
import InviteTeammateModal from '../components/InviteTeammateModal';
import { useAuth } from '../context/authStore';
import { useFarmData } from '../context/farmDataStore';
import { PLAN_TIERS } from '../data/plans';
import { payForPlan } from '../lib/paystack';
import { backendApi } from '../lib/backendApi';

const ROLE_TONE = { owner: 'good', manager: 'warning', staff: 'neutral' };

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function Field({ label, value, onChange, type = 'text', disabled }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="rounded-lg border border-border bg-card px-3 py-2 text-ink outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-muted">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-brand-500 disabled:opacity-60"
      />
    </label>
  );
}

export default function Settings() {
  const { user, upgradePlan, syncPlan, updateProfile, updateNotificationPrefs } = useAuth();
  const [savingPref, setSavingPref] = useState(null);
  const { flocks, team, currentPlan } = useFarmData();
  const teamAtLimit = team.length >= currentPlan.teamLimit;
  const canInvite = ['owner', 'manager'].includes(user.role);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSentTo, setInviteSentTo] = useState('');
  const [invites, setInvites] = useState([]);
  const [resendingId, setResendingId] = useState(null);
  const [resendMessage, setResendMessage] = useState('');
  const [form, setForm] = useState({ farmName: user.farm, managerName: user.name, phone: user.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  function loadInvites() {
    if (!canInvite) return;
    backendApi
      .get('/api/team/invites')
      .then(setInvites)
      .catch(() => {});
  }

  useEffect(loadInvites, [canInvite]);

  async function handleResend(invite) {
    setResendingId(invite.id);
    setResendMessage('');
    try {
      await backendApi.post(`/api/team/invite/${invite.id}/resend`, {});
      setResendMessage(`Invite resent to ${invite.email}.`);
      loadInvites();
    } catch (err) {
      setResendMessage(err.message);
    } finally {
      setResendingId(null);
    }
  }

  async function handleTogglePref(key, value) {
    setSavingPref(key);
    try {
      await updateNotificationPrefs({ [key]: value });
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPref(null);
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePlanSelect(planId) {
    const plan = PLAN_TIERS.find((p) => p.id === planId);

    if (!plan || plan.price === 0) {
      await upgradePlan(planId);
      setPlanModalOpen(false);
      return;
    }

    setPayingPlanId(planId);
    payForPlan({
      plan,
      email: user.email,
      onSuccess: (confirmedPlanId) => {
        syncPlan(confirmedPlanId[0].toUpperCase() + confirmedPlanId.slice(1));
        setPayingPlanId(null);
        setPlanModalOpen(false);
      },
      onError: (message) => {
        alert(message);
        setPayingPlanId(null);
      },
      onCancel: () => setPayingPlanId(null),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your farm profile and notification preferences" />

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Card className="px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Farm profile</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Farm name" value={form.farmName} onChange={(e) => updateField('farmName', e.target.value)} />
            <Field label="Manager name" value={form.managerName} onChange={(e) => updateField('managerName', e.target.value)} />
            <Field label="Email" value={user.email} type="email" disabled />
            <Field label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} type="tel" />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-good-ink">Saved.</span>}
          {saveError && <span className="text-sm text-critical-ink">{saveError}</span>}
        </div>
      </form>

      <Card className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Plan & billing</h2>
            <p className="mt-1 text-sm text-ink-soft">
              You're on the <span className="font-medium text-ink">{currentPlan.name}</span> plan
              {currentPlan.price > 0 ? ` — $${currentPlan.price}/mo` : ''}.
            </p>
          </div>
          <button
            onClick={() => setPlanModalOpen(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-surface"
          >
            Change plan
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-ink-muted">Flocks used</div>
            <div className="mt-0.5 text-sm font-medium text-ink">
              {flocks.length} of {currentPlan.flockLimit === Infinity ? 'unlimited' : currentPlan.flockLimit}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-muted">Team members used</div>
            <div className="mt-0.5 text-sm font-medium text-ink">
              {team.length} of {currentPlan.teamLimit === Infinity ? 'unlimited' : currentPlan.teamLimit}
            </div>
          </div>
        </div>
      </Card>

      <Card className="px-6 py-5">
        <h2 className="mb-1 text-base font-semibold text-ink">Notifications</h2>
        <div className="divide-y divide-border">
          <Toggle
            label="Critical alerts"
            description="Immediate mortality spikes or feed anomalies — emailed the moment one is confirmed"
            checked={user.notifyCritical}
            disabled={savingPref === 'notifyCritical'}
            onChange={(e) => handleTogglePref('notifyCritical', e.target.checked)}
          />
          <Toggle
            label="Daily summary"
            description="A recap of flock activity every morning"
            checked={user.notifyDailySummary}
            disabled={savingPref === 'notifyDailySummary'}
            onChange={(e) => handleTogglePref('notifyDailySummary', e.target.checked)}
          />
          <Toggle
            label="Weekly reports"
            description="Auto-generated health and feed reports"
            checked={user.notifyWeeklyReports}
            disabled={savingPref === 'notifyWeeklyReports'}
            onChange={(e) => handleTogglePref('notifyWeeklyReports', e.target.checked)}
          />
        </div>
      </Card>

      <Card className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Team</h2>
          {canInvite &&
            (teamAtLimit ? (
              <button
                onClick={() => setPlanModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface"
              >
                <Lock size={14} />
                Upgrade to invite more
              </button>
            ) : (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface"
              >
                <UserPlus size={14} />
                Invite teammate
              </button>
            ))}
        </div>
        {inviteSentTo && <p className="mb-3 text-sm text-good-ink">Invite sent to {inviteSentTo}.</p>}
        <div className="divide-y divide-border">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-ink">{member.name}</div>
                {member.id === user.id && <div className="text-xs text-ink-muted">{user.email}</div>}
              </div>
              <Badge tone={ROLE_TONE[member.role]}>{capitalize(member.role)}</Badge>
            </div>
          ))}
        </div>

        {canInvite && invites.length > 0 && (
          <>
            <h3 className="mb-1 mt-5 text-xs font-medium uppercase tracking-wide text-ink-muted">Pending invites</h3>
            {resendMessage && <p className="mb-2 text-xs text-ink-soft">{resendMessage}</p>}
            <div className="divide-y divide-border">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-ink">{invite.email}</div>
                    <div className="text-xs text-ink-muted">
                      {capitalize(invite.role)} · expires {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleResend(invite)}
                    disabled={resendingId === invite.id}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline disabled:opacity-60"
                  >
                    <Send size={13} />
                    {resendingId === invite.id ? 'Resending…' : 'Resend'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {planModalOpen && (
        <PlanPickerModal
          currentPlanId={user.plan}
          payingPlanId={payingPlanId}
          onSelect={handlePlanSelect}
          onClose={() => setPlanModalOpen(false)}
        />
      )}

      {inviteModalOpen && (
        <InviteTeammateModal
          onClose={() => setInviteModalOpen(false)}
          onInvited={(email) => {
            setInviteModalOpen(false);
            setInviteSentTo(email);
            loadInvites();
          }}
        />
      )}
    </div>
  );
}
