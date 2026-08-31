import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { adminApi } from '../../lib/adminApi';

export default function Users() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/users').then(setUsers).catch((err) => setError(err.message));
  }, []);

  async function toggleStatus(user) {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.patch(`/users/${user.id}`, { status: nextStatus });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <p className="text-sm text-critical-ink">{error}</p>;
  if (!users) return <p className="text-sm text-ink-soft">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" subtitle={`${users.length} users across every farm`} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Farm</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Last login</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-xs text-ink-muted">{u.email}</div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{u.farmName}</td>
                  <td className="px-5 py-3 text-ink-soft capitalize">{u.role}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.lastLogin ? u.lastLogin.slice(0, 10) : 'Never'}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.status === 'active' ? 'good' : 'critical'}>
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => toggleStatus(u)} className="text-sm font-medium text-brand-500 hover:underline">
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
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
