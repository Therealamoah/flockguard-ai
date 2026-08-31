// Pure functions that turn raw flocks + daily_records rows (from Supabase)
// into the display shapes the pages already expect. Keeping this separate
// from FarmDataContext means the derivation logic is easy to test on its
// own and easy to swap out once real trend/FCR data is available.

export function ageDaysFromHatch(hatchDate) {
  const ms = Date.now() - new Date(hatchDate).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function latestRecordsFor(flockId, dailyRecords) {
  return dailyRecords
    .filter((r) => r.flockId === flockId)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function deriveFlock(flock, dailyRecords) {
  const [latest, previous] = latestRecordsFor(flock.id, dailyRecords);

  const mortalityRate = latest ? Number(((latest.mortality / flock.birds) * 100).toFixed(2)) : 0;
  const status = flock.risk === 'low' ? 'healthy' : 'attention';

  let eggProdTrend = null;
  if (flock.type === 'Layers' && latest?.eggCount != null && previous?.eggCount) {
    eggProdTrend = Math.round(((latest.eggCount - previous.eggCount) / previous.eggCount) * 100);
  }

  const note = latest
    ? `feed ${latest.feedKg}kg · mortality ${mortalityRate}%`
    : 'No records yet';

  return {
    ...flock,
    ageDays: ageDaysFromHatch(flock.hatchDate),
    status,
    mortalityRate,
    eggProdTrend,
    note,
  };
}

export function deriveFeedConsumption7d(dailyRecords) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  return days.map((date) => ({
    day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    kg: dailyRecords.filter((r) => r.date === date).reduce((sum, r) => sum + Number(r.feedKg || 0), 0),
  }));
}

export function deriveRiskDistribution(flocks) {
  return [
    { key: 'low', label: 'Low risk', value: flocks.filter((f) => f.risk === 'low').length },
    { key: 'medium', label: 'Medium risk', value: flocks.filter((f) => f.risk === 'medium').length },
    { key: 'high', label: 'High risk', value: flocks.filter((f) => f.risk === 'high').length },
  ];
}

export function deriveHealthMetrics(flocks, dailyRecords) {
  return flocks.map((flock) => {
    const [latest] = latestRecordsFor(flock.id, dailyRecords);
    const mortalityRate = latest ? Number(((latest.mortality / flock.birds) * 100).toFixed(2)) : 0;
    const fcr =
      latest?.weightGainG && flock.birds
        ? Number(((latest.feedKg * 1000) / (latest.weightGainG * flock.birds)).toFixed(2))
        : null;

    return {
      flockId: flock.id,
      flockName: `${flock.name} — ${flock.type}`,
      status: flock.risk === 'low' ? 'healthy' : 'attention',
      mortalityRate,
      fcr,
      temperature: latest?.temperature ?? null,
      humidity: latest?.humidity ?? null,
    };
  });
}
