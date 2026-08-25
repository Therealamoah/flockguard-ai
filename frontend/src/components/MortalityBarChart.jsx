import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <div className="font-medium text-ink">{label}</div>
      <div className="text-ink-soft">
        <span className="font-semibold text-ink">{payload[0].value}%</span> mortality rate
      </div>
    </div>
  );
}

export default function MortalityBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="#e3e6e2" strokeDasharray="3 3" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a938c', fontSize: 12 }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a938c', fontSize: 12 }} width={32} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: '#eef0ee' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.value >= 1 ? '#d03b3b' : '#2f7d54'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
