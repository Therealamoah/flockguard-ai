import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PlanPickerModal from '../components/PlanPickerModal';
import { useAuth } from '../context/authStore';
import { useFarmData } from '../context/farmDataStore';
import { PLAN_TIERS } from '../data/plans';

const colleagues = [
  { id: 2, name: 'Ama Boateng', email: 'ama.boateng@colnettfarm.com', role: 'Manager' },
  { id: 3, name: 'Kwesi Owusu', email: 'kwesi.owusu@colnettfarm.com', role: 'Staff' },
];

const ROLE_TONE = { Owner: 'good', Manager: 'warning', Staff: 'neutral' };

function Field({ label, defaultValue, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="rounded-lg border border-border bg-card px-3 py-2 text-ink outline-none focus:border-brand-500"
      />
    </label>
  );
}

function Toggle({ label, description, defaultChecked }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-muted">{description}</div>
      </div>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-brand-500" />
    </label>
  );
}

export default function Settings() {
  const { user, upgradePlan } = useAuth();
  const { flocks } = useFarmData();
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const team = [{ id: 1, name: user.name, email: user.email, role: 'Owner' }, ...colleagues];
  const currentPlan = PLAN_TIERS.find((p) => p.id === user.plan) ?? PLAN_TIERS[0];

  function handlePlanSelect(planId) {
    upgradePlan(planId);
    setPlanModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your farm profile and notification preferences" />

      <Card className="px-6 py-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Farm profile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Farm name" defaultValue={user.farm} />
          <Field label="Manager name" defaultValue={user.name} />
          <Field label="Email" defaultValue={user.email} type="email" />
          <Field label="Phone" defaultValue="+233 20 000 0000" type="tel" />
        </div>
      </Card>

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
            description="Immediate mortality spikes or feed anomalies"
            defaultChecked
          />
          <Toggle
            label="Daily summary"
            description="A recap of flock activity every morning"
            defaultChecked
          />
          <Toggle
            label="Weekly reports"
            description="Auto-generated health and feed reports"
            defaultChecked={false}
          />
        </div>
      </Card>

      <Card className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Team</h2>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface">
            <UserPlus size={14} />
            Invite teammate
          </button>
        </div>
        <div className="divide-y divide-border">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-ink">{member.name}</div>
                <div className="text-xs text-ink-muted">{member.email}</div>
              </div>
              <Badge tone={ROLE_TONE[member.role]}>{member.role}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <button className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          Save changes
        </button>
      </div>

      {planModalOpen && (
        <PlanPickerModal
          currentPlanId={user.plan}
          onSelect={handlePlanSelect}
          onClose={() => setPlanModalOpen(false)}
        />
      )}
    </div>
  );
}
