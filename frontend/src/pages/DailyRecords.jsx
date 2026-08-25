import { useState } from 'react';
import { Paperclip, TriangleAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LogRecordModal from '../components/LogRecordModal';
import VerifyActions from '../components/VerifyActions';
import { useFarmData } from '../context/farmDataStore';
import { BEHAVIOR_LABELS, VERIFY_LABELS, VERIFY_TONES } from '../lib/status';

function Metric({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

export default function DailyRecords() {
  const { dailyRecords, flocksById, addDailyRecord, verifyRecord, flocks } = useFarmData();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(input) {
    addDailyRecord(input);
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Daily records"
        subtitle="Feed, water, mortality, production, and house conditions logged by staff"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Log today's record
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        {dailyRecords.map((record) => {
          const flock = flocksById[record.flockId];
          return (
            <Card
              key={record.id}
              className={
                record.flagged && record.verified === 'pending'
                  ? 'border-warning-bg bg-warning-bg/40 px-5 py-4'
                  : 'px-5 py-4'
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">
                      {flock.name} — {flock.type}
                    </span>
                    {record.flagged && (
                      <Badge tone={VERIFY_TONES[record.verified]}>{VERIFY_LABELS[record.verified]}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {record.date} · {flock.house}
                  </div>
                </div>
                {record.flagged && record.verified === 'pending' && (
                  <VerifyActions
                    onConfirm={() => verifyRecord(record.id, 'confirmed')}
                    onDismiss={() => verifyRecord(record.id, 'dismissed')}
                  />
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <Metric label="Feed" value={`${record.feedKg.toLocaleString()} kg`} />
                <Metric label="Water" value={`${record.waterL.toLocaleString()} L`} />
                <Metric label="Mortality" value={record.mortality} />
                {flock.type === 'Layers' ? (
                  <Metric label="Eggs" value={record.eggCount?.toLocaleString()} />
                ) : (
                  <Metric label="Weight gain" value={record.weightGainG ? `${record.weightGainG} g/bird` : null} />
                )}
                <Metric label="Temp" value={record.temperature != null ? `${record.temperature}°C` : null} />
                <Metric label="Humidity" value={record.humidity != null ? `${record.humidity}%` : null} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <span className="rounded-full bg-surface px-2 py-1">{BEHAVIOR_LABELS[record.behavior]}</span>
                {record.evidence && (
                  <span className="flex items-center gap-1 rounded-full bg-surface px-2 py-1">
                    <Paperclip size={11} />
                    {record.evidence.name}
                  </span>
                )}
              </div>

              {record.notes && <p className="mt-2 text-sm text-ink-soft">{record.notes}</p>}

              {record.flagged && record.reasons.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-card/60 px-3 py-2 text-xs text-warning-ink">
                  <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                  <ul className="list-disc space-y-0.5 pl-4">
                    {record.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {modalOpen && (
        <LogRecordModal flocks={flocks} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
