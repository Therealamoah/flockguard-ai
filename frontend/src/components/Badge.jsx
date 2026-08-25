import clsx from 'clsx';

const TONES = {
  good: 'bg-good-bg text-good-ink',
  warning: 'bg-warning-bg text-warning-ink',
  critical: 'bg-critical-bg text-critical-ink',
  neutral: 'bg-surface text-ink-soft',
};

export default function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
