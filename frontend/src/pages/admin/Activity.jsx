import { Link } from 'react-router-dom';
import { UserPlus, CreditCard, AlertTriangle, LifeBuoy, Users, Server } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import { activityLog, farms } from '../../data/adminMockData';

const farmNameById = Object.fromEntries(farms.map((f) => [f.id, f.name]));

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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity" subtitle="Notable events across the platform" />

      <div className="flex flex-col gap-3">
        {activityLog.map((event) => {
          const Icon = TYPE_ICON[event.type];
          return (
            <Card key={event.id} className="flex items-start gap-3 px-5 py-4">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_TONE[event.type]}`}>
                <Icon size={15} />
              </span>
              <div className="flex-1">
                <p className="text-sm text-ink">{event.text}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  <span>{event.time}</span>
                  {event.farmId && (
                    <>
                      <span>·</span>
                      <Link to={`/admin/farms/${event.farmId}`} className="font-medium text-brand-500 hover:underline">
                        {farmNameById[event.farmId]}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
