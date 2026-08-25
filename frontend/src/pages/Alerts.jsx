import { AlertTriangle, TriangleAlert, ShieldQuestion } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import VerifyActions from '../components/VerifyActions';
import { useFarmData } from '../context/farmDataStore';
import { BEHAVIOR_LABELS } from '../lib/status';

const SEVERITY_TONE = {
  critical: 'critical',
  warning: 'warning',
};

const SEVERITY_LABEL = {
  critical: 'Critical',
  warning: 'Warning',
};

export default function Alerts() {
  const { alerts, pendingVerification, flocksById, verifyRecord } = useFarmData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts"
        subtitle={`${pendingVerification.length} awaiting verification · ${alerts.length} confirmed alerts`}
      />

      {pendingVerification.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
            <ShieldQuestion size={17} className="text-warning-ink" />
            Needs verification
          </h2>
          <div className="flex flex-col gap-3">
            {pendingVerification.map((record) => {
              const flock = flocksById[record.flockId];
              return (
                <Card key={record.id} className="border-warning-bg bg-warning-bg/40 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink">
                        {flock.name} — {flock.type}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {flock.house} · {record.date} · {BEHAVIOR_LABELS[record.behavior]}
                      </div>
                    </div>
                    <VerifyActions
                      onConfirm={() => verifyRecord(record.id, 'confirmed')}
                      onDismiss={() => verifyRecord(record.id, 'dismissed')}
                    />
                  </div>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-warning-ink">
                    {record.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {pendingVerification.length > 0 && <h2 className="mb-3 text-base font-semibold text-ink">Confirmed alerts</h2>}
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const Icon = alert.severity === 'critical' ? AlertTriangle : TriangleAlert;
            return (
              <Card key={alert.id} className="flex items-start gap-3 px-5 py-4">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    alert.severity === 'critical' ? 'bg-critical-bg text-critical-ink' : 'bg-warning-bg text-warning-ink'
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{alert.flockName}</span>
                    <Badge tone={SEVERITY_TONE[alert.severity]}>{SEVERITY_LABEL[alert.severity]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{alert.message}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {alert.house} · {alert.time}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
