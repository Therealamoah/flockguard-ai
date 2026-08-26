import { X } from 'lucide-react';
import PlanCard from './PlanCard';
import { PLAN_TIERS } from '../data/plans';

export default function PlanPickerModal({ currentPlanId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Choose a plan</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLAN_TIERS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlanId}
              ctaLabel={`Switch to ${plan.name}`}
              onSelect={() => onSelect(plan.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
