import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, PlayCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { farms, platformUsers, activityLog } from '../../data/adminMockData';

const STATUS_TONE = { active: 'good', trial: 'warning', suspended: 'critical' };
const STATUS_LABEL = { active: 'Active', trial: 'Trial', suspended: 'Suspended' };

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}

export default function FarmDetail() {
  const { farmId } = useParams();
  const farm = farms.find((f) => f.id === farmId);

  if (!farm) {
    return (
      <div className="flex flex-col gap-6">
        <Link to="/admin/farms" className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft size={14} />
          Back to farms
        </Link>
        <EmptyState title="Farm not found" body="This farm may have been removed." />
      </div>
    );
  }

  const users = platformUsers.filter((u) => u.farmId === farmId);
  const events = activityLog.filter((e) => e.farmId === farmId);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/farms" className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={14} />
        Back to farms
      </Link>

      <PageHeader
        title={farm.name}
        subtitle={`Owned by ${farm.owner} · ${farm.email}`}
        actions={
          farm.status === 'suspended' ? (
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              <PlayCircle size={14} />
              Reactivate account
            </button>
          ) : (
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-critical-ink hover:bg-critical-bg">
              <Ban size={14} />
              Suspend account
            </button>
          )
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <Badge tone={STATUS_TONE[farm.status]}>{STATUS_LABEL[farm.status]}</Badge>
          <span className="text-sm text-ink-soft">{farm.plan} plan</span>
        </div>
        <div className="flex gap-8">
          <Metric label="Flocks" value={farm.flockCount} />
          <Metric label="Birds" value={farm.birdCount.toLocaleString()} />
          <Metric label="Users" value={farm.userCount} />
          <Metric label="Signed up" value={farm.signupDate} />
          <Metric label="Last active" value={farm.lastActive} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Users on this farm</h2>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-ink">{u.name}</div>
                    <div className="text-xs text-ink-muted">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <Badge tone="neutral">{u.role}</Badge>
                    <div className="mt-1 text-xs text-ink-muted">Last login {u.lastLogin}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Recent activity</h2>
          <Card className="overflow-hidden">
            {events.length === 0 ? (
              <div className="px-5 py-8">
                <EmptyState title="No recent activity" body="Nothing logged for this farm yet." />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((e) => (
                  <div key={e.id} className="px-5 py-3">
                    <p className="text-sm text-ink-soft">{e.text}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{e.time}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <p className="text-xs text-ink-muted">Read-only view — for support use only. Changes made here are not persisted yet.</p>
    </div>
  );
}
