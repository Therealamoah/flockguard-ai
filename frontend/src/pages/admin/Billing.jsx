import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import { adminApi } from '../../lib/adminApi';

const PLAN_TONE = { free: 'neutral', pro: 'good', enterprise: 'warning' };

export default function Billing() {
  const [farms, setFarms] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/billing').then(setFarms).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-critical-ink">{error}</p>;
  if (!farms) return <p className="text-sm text-ink-soft">Loading…</p>;

  const mrr = farms.reduce((sum, f) => sum + (f.status === 'suspended' ? 0 : f.price), 0);
  const paidFarms = farms.filter((f) => f.plan !== 'free').length;
  const trials = farms.filter((f) => f.status === 'trial').length;
  const overdue = farms.filter((f) => f.status === 'suspended').length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing" subtitle="Subscription status across every farm" />

      <div className="flex flex-wrap gap-4">
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} />
        <StatCard label="Paid subscriptions" value={paidFarms} />
        <StatCard label="Trials" value={trials} />
        <StatCard label="Overdue" value={overdue} tone={overdue > 0 ? 'critical' : 'neutral'} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Farm</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Payment status</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{farm.name}</div>
                    <div className="text-xs text-ink-muted">{farm.owner || '—'}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={PLAN_TONE[farm.plan]}>{farm.plan}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{farm.price === 0 ? 'Free' : `$${farm.price}/mo`}</td>
                  <td className="px-5 py-3">
                    {farm.status === 'suspended' ? (
                      <Badge tone="critical">Payment overdue</Badge>
                    ) : farm.plan === 'free' ? (
                      <span className="text-xs text-ink-muted">—</span>
                    ) : (
                      <Badge tone="good">Paid</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
