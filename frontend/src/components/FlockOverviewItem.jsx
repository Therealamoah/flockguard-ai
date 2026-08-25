import clsx from 'clsx';
import Card from './Card';
import Badge from './Badge';
import { RISK_LABELS, RISK_TONES, RISK_ACCENT } from '../lib/status';

export default function FlockOverviewItem({ flock }) {
  return (
    <Card
      className={clsx(
        'flex items-center justify-between gap-4 border-l-4 px-4 py-3.5',
        RISK_ACCENT[flock.risk]
      )}
    >
      <div>
        <div className="font-medium text-ink">
          {flock.name} — {flock.type}
        </div>
        <div className="mt-0.5 text-sm text-ink-soft">
          {flock.birds.toLocaleString()} birds · {flock.note}
        </div>
      </div>
      <Badge tone={RISK_TONES[flock.risk]}>{RISK_LABELS[flock.risk]}</Badge>
    </Card>
  );
}
