import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function UpgradePrompt({ feature }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-100 text-brand-500">
        <Lock size={18} />
      </span>
      <div>
        <div className="font-medium text-ink">{feature} is a Pro feature</div>
        <p className="mt-1 text-sm text-ink-soft">Upgrade your plan to unlock this.</p>
      </div>
      <Link
        to="/app/settings"
        className="mt-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Upgrade plan
      </Link>
    </div>
  );
}
