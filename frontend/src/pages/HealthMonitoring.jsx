import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { healthMetrics } from '../data/mockData';
import { STATUS_LABELS, STATUS_TONES } from '../lib/status';

function Metric({ label, value, warn }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${warn ? 'text-critical-ink' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}

export default function HealthMonitoring() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Health monitoring"
        subtitle="Live vitals tracked per flock — mortality rate, feed conversion, and house conditions"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {healthMetrics.map((m) => (
          <Card key={m.flockId} className="flex flex-col gap-4 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-ink">{m.flockName}</div>
              <Badge tone={STATUS_TONES[m.status]}>{STATUS_LABELS[m.status]}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Metric label="Mortality" value={`${m.mortalityRate}%`} warn={m.mortalityRate >= 1} />
              <Metric label="FCR" value={m.fcr.toFixed(2)} warn={m.fcr >= 2.2} />
              <Metric label="Temp" value={`${m.temperature}°C`} warn={m.temperature >= 30} />
              <Metric label="Humidity" value={`${m.humidity}%`} warn={m.humidity >= 72} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
