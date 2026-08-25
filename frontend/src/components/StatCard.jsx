import clsx from 'clsx';
import Card from './Card';

const TONES = {
  neutral: { card: '', label: 'text-ink-soft', value: 'text-ink' },
  good: { card: 'bg-good-bg border-transparent', label: 'text-good-ink', value: 'text-good-ink' },
  critical: { card: 'bg-critical-bg border-transparent', label: 'text-critical-ink', value: 'text-critical-ink' },
};

export default function StatCard({ label, value, tone = 'neutral' }) {
  const t = TONES[tone];
  return (
    <Card className={clsx('flex-1 min-w-[140px] px-5 py-4', t.card)}>
      <div className={clsx('text-sm', t.label)}>{label}</div>
      <div className={clsx('mt-1.5 text-3xl font-semibold tracking-tight', t.value)}>{value}</div>
    </Card>
  );
}
