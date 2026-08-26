import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <div className="font-medium text-ink">{label}</div>
      <div className="text-ink-soft">
        <span className="font-semibold text-brand-500">{payload[0].value.toLocaleString()}</span> {unit}
      </div>
    </div>
  );
}

export default function TrendChart({ data, xKey, yKey, unit }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f7d54" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#2f7d54" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e3e6e2" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#8a938c', fontSize: 12 }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a938c', fontSize: 12 }} width={28} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#c7cdc8', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke="#2f7d54"
          strokeWidth={2}
          fill="url(#adminTrendFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
