export const inputClass =
  'rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-brand-500';

export default function FormField({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
