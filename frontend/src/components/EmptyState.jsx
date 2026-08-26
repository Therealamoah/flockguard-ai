export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-muted">
          <Icon size={18} />
        </span>
      )}
      <div className="text-sm font-medium text-ink">{title}</div>
      {body && <p className="max-w-xs text-sm text-ink-soft">{body}</p>}
      {action}
    </div>
  );
}
