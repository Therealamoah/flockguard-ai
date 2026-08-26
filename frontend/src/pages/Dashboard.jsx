import { Link } from 'react-router-dom';
import { ShieldQuestion } from 'lucide-react';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import FlockOverviewItem from '../components/FlockOverviewItem';
import FeedChart from '../components/FeedChart';
import RiskDonut from '../components/RiskDonut';
import { useFarmData } from '../context/farmDataStore';
import { useAuth } from '../context/authStore';
import {
  flocks,
  totalBirds,
  healthyCount,
  attentionCount,
  feedConsumption7d,
  riskDistribution,
} from '../data/mockData';

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function Dashboard() {
  const { alerts, pendingVerification } = useFarmData();
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];
  const latestAlert = alerts[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Here's how your farm is doing today · {today}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <StatCard label="Flocks" value={flocks.length} />
        <StatCard label="Birds" value={totalBirds.toLocaleString()} />
        <StatCard label="Healthy" value={healthyCount} tone="good" />
        <StatCard label="Attention" value={attentionCount} tone="critical" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Flock health overview</h2>
            <div className="flex flex-col gap-3">
              {flocks.slice(0, 2).map((flock) => (
                <FlockOverviewItem key={flock.id} flock={flock} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Recent alerts</h2>
            <Card className="border-critical-bg bg-critical-bg px-4 py-3.5">
              <p className="text-sm text-critical-ink">
                <span className="font-medium">{latestAlert.flockName}</span> — {latestAlert.message} ·{' '}
                {latestAlert.time}
              </p>
            </Card>
          </div>

          {pendingVerification.length > 0 && (
            <Link
              to="/app/alerts"
              className="flex items-center gap-2.5 rounded-2xl border border-warning-bg bg-warning-bg/50 px-4 py-3 text-sm text-warning-ink hover:bg-warning-bg"
            >
              <ShieldQuestion size={16} className="shrink-0" />
              <span>
                <span className="font-medium">{pendingVerification.length} record{pendingVerification.length === 1 ? '' : 's'}</span>{' '}
                flagged by pattern detection — needs your verification
              </span>
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Feed consumption — 7 days</h2>
            <Card className="px-4 py-4">
              <FeedChart data={feedConsumption7d} />
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Risk distribution</h2>
            <Card className="px-5 py-5">
              <RiskDonut data={riskDistribution} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
