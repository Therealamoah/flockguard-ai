import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <div className="font-medium text-ink">{label}</div>
      <div className="mt-0.5 text-ink-soft">
        <span className="font-semibold text-brand-500">{payload[0].value.toLocaleString()} kg</span> consumed
      </div>
    </div>
  );
}

export default function FeedChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="feedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f7d54" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#2f7d54" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e3e6e2" strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#8a938c', fontSize: 12 }}
          dy={8}
        />
        <YAxis hide domain={['dataMin - 400', 'dataMax + 400']} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7cdc8', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="kg"
          stroke="#2f7d54"
          strokeWidth={2}
          fill="url(#feedFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
