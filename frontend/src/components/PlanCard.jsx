import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function PlanCard({ plan, isCurrent, ctaHref, ctaLabel, onSelect }) {
  const ctaClass = clsx(
    'block w-full rounded-lg px-4 py-2 text-center text-sm font-medium',
    plan.highlight ? 'bg-brand-500 text-white hover:bg-brand-600' : 'border border-border text-ink-soft hover:bg-surface'
  );

  return (
    <div
      className={clsx(
        'flex flex-col rounded-2xl border bg-card px-6 py-6',
        plan.highlight ? 'border-brand-500 shadow-md' : 'border-border'
      )}
    >
      {plan.highlight && (
        <span className="mb-3 w-fit rounded-full bg-mint-100 px-2.5 py-1 text-xs font-medium text-brand-500">
          Most popular
        </span>
      )}
      <div className="text-base font-semibold text-ink">{plan.name}</div>
      <p className="mt-1 text-sm text-ink-soft">{plan.tagline}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-ink">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
        {plan.price > 0 && <span className="text-sm text-ink-muted">/mo</span>}
      </div>

      <ul className="mt-5 flex flex-col gap-2 text-sm text-ink-soft">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-brand-500" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isCurrent ? (
          <span className="block rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-ink-muted">
            Current plan
          </span>
        ) : ctaHref ? (
          <Link to={ctaHref} className={ctaClass}>
            {ctaLabel}
          </Link>
        ) : (
          <button onClick={onSelect} className={ctaClass}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
