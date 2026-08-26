import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { confirmed: '#0ca30c', dismissed: '#8a938c' };

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <div className="font-medium text-ink">{item.name}</div>
      <div className="text-ink-soft">{item.value}%</div>
    </div>
  );
}

export default function OutcomeDonut({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[120px] w-[120px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={38} outerRadius={56} paddingAngle={3} stroke="#ffffff" strokeWidth={2}>
              {data.map((d) => (
                <Cell key={d.key} fill={COLORS[d.key]} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-ink">{total}%</span>
          <span className="text-[10px] text-ink-muted">verified</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[d.key] }} />
            <span className="text-ink-soft">{d.label}</span>
            <span className="font-medium text-ink">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
