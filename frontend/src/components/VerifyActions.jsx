import { ShieldCheck, ShieldX } from 'lucide-react';

export default function VerifyActions({ onConfirm, onDismiss }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onConfirm}
        className="flex items-center gap-1.5 rounded-lg bg-critical px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
      >
        <ShieldCheck size={13} />
        Confirm — raise alert
      </button>
      <button
        onClick={onDismiss}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface"
      >
        <ShieldX size={13} />
        Dismiss
      </button>
    </div>
  );
}
