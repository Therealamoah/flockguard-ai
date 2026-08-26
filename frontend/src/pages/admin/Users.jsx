import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { platformUsers, farms } from '../../data/adminMockData';

const farmNameById = Object.fromEntries(farms.map((f) => [f.id, f.name]));

export default function Users() {
  const [users, setUsers] = useState(platformUsers);

  function toggleStatus(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
    );
  }

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
                  <td className="px-5 py-3 text-ink-soft">{farmNameById[u.farmId]}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.role}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.lastLogin}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.status === 'active' ? 'good' : 'critical'}>
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="text-sm font-medium text-brand-500 hover:underline"
                    >
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
