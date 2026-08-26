import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import TrendChart from '../../components/admin/TrendChart';
import OutcomeDonut from '../../components/admin/OutcomeDonut';
import { platformStats, alertsPerWeek, verificationOutcomes } from '../../data/adminMockData';

export default function Overview() {
  const stats = platformStats();
  const alertsThisWeek = alertsPerWeek[alertsPerWeek.length - 1].alerts;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" subtitle="How FlockGuard is doing across every farm on the platform" />

      <div className="flex flex-wrap gap-4">
        <StatCard label="Farms" value={stats.totalFarms} />
        <StatCard label="MRR" value={`$${stats.mrr.toLocaleString()}`} />
        <StatCard label="Birds monitored" value={stats.totalBirds.toLocaleString()} />
        <StatCard label="Alerts this week" value={alertsThisWeek} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Alerts per week — platform-wide</h2>
          <Card className="px-4 py-4">
            <TrendChart data={alertsPerWeek} xKey="week" yKey="alerts" unit="alerts" />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Verification outcomes</h2>
            <Card className="px-5 py-5">
              <OutcomeDonut data={verificationOutcomes} />
              <p className="mt-3 text-xs text-ink-muted">
                Share of AI-flagged records farmers confirmed vs. dismissed in the last 30 days.
              </p>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Farm status</h2>
            <Card className="flex flex-col gap-3 px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <Badge tone="good">Active</Badge>
                <span className="font-medium text-ink">{stats.activeFarms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Badge tone="warning">Trial</Badge>
                <span className="font-medium text-ink">{stats.trialFarms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Badge tone="critical">Suspended</Badge>
                <span className="font-medium text-ink">{stats.suspendedFarms}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
