import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { adminApi } from '../../lib/adminApi';

const STATUS_TONE = { active: 'good', trial: 'warning', suspended: 'critical' };
const STATUS_LABEL = { active: 'Active', trial: 'Trial', suspended: 'Suspended' };

export default function Farms() {
  const [farms, setFarms] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/farms').then(setFarms).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-critical-ink">{error}</p>;
  if (!farms) return <p className="text-sm text-ink-soft">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Farms" subtitle={`${farms.length} farms registered on the platform`} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Farm</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Flocks</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Signed up</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{farm.name}</div>
                    <div className="text-xs text-ink-muted">{farm.owner || '—'}</div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft capitalize">{farm.plan}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[farm.status]}>{STATUS_LABEL[farm.status]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{farm.flockCount}</td>
                  <td className="px-5 py-3 text-ink-soft">{farm.userCount}</td>
                  <td className="px-5 py-3 text-ink-soft">{farm.signupDate}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/admin/farms/${farm.id}`} className="text-sm font-medium text-brand-500 hover:underline">
                      View
                    </Link>
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
