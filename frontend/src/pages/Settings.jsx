import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { currentUser } from '../data/mockData';

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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your farm profile and notification preferences" />

      <Card className="px-6 py-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Farm profile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Farm name" defaultValue={currentUser.farm} />
          <Field label="Manager name" defaultValue={currentUser.name} />
          <Field label="Email" defaultValue={currentUser.email} type="email" />
          <Field label="Phone" defaultValue="+233 20 000 0000" type="tel" />
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

      <div>
        <button className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          Save changes
        </button>
      </div>
    </div>
  );
}
