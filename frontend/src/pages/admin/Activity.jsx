import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CreditCard, AlertTriangle, LifeBuoy, Users, Server } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../lib/adminApi';

const TYPE_ICON = {
  signup: UserPlus,
  billing: CreditCard,
  alert: AlertTriangle,
  support: LifeBuoy,
  team: Users,
  system: Server,
};

const TYPE_TONE = {
  signup: 'text-good-ink bg-good-bg',
  billing: 'text-warning-ink bg-warning-bg',
  alert: 'text-critical-ink bg-critical-bg',
  support: 'text-ink-soft bg-surface',
  team: 'text-brand-500 bg-mint-100',
  system: 'text-ink-soft bg-surface',
};

export default function Activity() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/activity').then(setEvents).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-critical-ink">{error}</p>;
  if (!events) return <p className="text-sm text-ink-soft">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity" subtitle="Notable events across the platform" />

      {events.length === 0 ? (
        <EmptyState icon={Server} title="No activity yet" body="Platform events will show up here as farms sign up and use the app." />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const Icon = TYPE_ICON[event.type] ?? Server;
            return (
              <Card key={event.id} className="flex items-start gap-3 px-5 py-4">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_TONE[event.type] ?? TYPE_TONE.system}`}>
                  <Icon size={15} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-ink">{event.text}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                    <span>{event.time?.slice(0, 16).replace('T', ' ')}</span>
                    {event.farmId && (
                      <>
                        <span>·</span>
                        <Link to={`/admin/farms/${event.farmId}`} className="font-medium text-brand-500 hover:underline">
                          {event.farmName}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
