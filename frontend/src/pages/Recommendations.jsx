import { Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import UpgradePrompt from '../components/UpgradePrompt';
import { useFarmData } from '../context/farmDataStore';
import { PRIORITY_LABELS, PRIORITY_TONES } from '../lib/status';

export default function Recommendations() {
  const { recommendations, currentPlan } = useFarmData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recommendations"
        subtitle="AI-generated guidance based on recent flock activity"
      />

      {!currentPlan.capabilities.recommendations ? (
        <UpgradePrompt feature="Recommendations" />
      ) : recommendations.length === 0 ? (
        <EmptyState icon={Sparkles} title="No recommendations right now" body="Guidance shows up here once activity needs your attention." />
      ) : (
      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="flex items-start gap-3 px-5 py-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint-100 text-brand-500">
              <Sparkles size={16} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">{rec.title}</span>
                <Badge tone={PRIORITY_TONES[rec.priority]}>{PRIORITY_LABELS[rec.priority]}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-muted">{rec.flockName}</p>
              <p className="mt-2 text-sm text-ink-soft">{rec.body}</p>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
