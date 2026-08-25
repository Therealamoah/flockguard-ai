import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { flocks } from '../data/mockData';
import { RISK_LABELS, RISK_TONES, STATUS_LABELS, STATUS_TONES } from '../lib/status';

export default function Flocks() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My flocks" subtitle={`${flocks.length} flocks across your farm`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {flocks.map((flock) => (
          <Card key={flock.id} className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-ink">
                  {flock.name} — {flock.type}
                </div>
                <div className="text-sm text-ink-soft">{flock.house}</div>
              </div>
              <Badge tone={RISK_TONES[flock.risk]}>{RISK_LABELS[flock.risk]}</Badge>
            </div>

            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-muted">Birds</dt>
              <dd className="text-right font-medium text-ink">{flock.birds.toLocaleString()}</dd>
              <dt className="text-ink-muted">Age</dt>
              <dd className="text-right font-medium text-ink">{flock.ageDays} days</dd>
              <dt className="text-ink-muted">Mortality rate</dt>
              <dd className="text-right font-medium text-ink">{flock.mortalityRate}%</dd>
              {flock.eggProdTrend !== null && (
                <>
                  <dt className="text-ink-muted">Egg production</dt>
                  <dd className="text-right font-medium text-ink">
                    {flock.eggProdTrend > 0 ? '+' : ''}
                    {flock.eggProdTrend}%
                  </dd>
                </>
              )}
            </dl>

            <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
              <Badge tone={STATUS_TONES[flock.status]}>{STATUS_LABELS[flock.status]}</Badge>
              <span className="text-xs text-ink-muted">{flock.note}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
