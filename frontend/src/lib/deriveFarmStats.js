// Pure functions that turn raw flocks + daily_records rows (from Supabase)
// into the display shapes the pages already expect. Keeping this separate
// from FarmDataContext means the derivation logic is easy to test on its
// own and easy to swap out once real trend/FCR data is available.

export function ageDaysFromHatch(hatchDate) {
  const ms = Date.now() - new Date(hatchDate).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

// Evening-only: mortality, behavior, temperature/humidity, eggs, and weight
// gain are only ever captured on the evening check-in (the morning check-in
// just records feed/water given), so anything reading those fields needs
// the latest evening row, not just the latest row of either period.
export function latestRecordsFor(flockId, dailyRecords) {
  return dailyRecords
    .filter((r) => r.flockId === flockId && r.period !== 'morning')
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
    // Build the date key from local date fields (not toISOString, which
    // reinterprets in UTC and can land on the wrong calendar day depending
    // on timezone/time-of-day) so it lines up with the same local day used
    // for the weekday label.
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({ date, day });
  }

  // Evening-only -- this chart tracks actual consumption, not what was
  // given this morning (that's a separate, deliberately larger number).
  return days.map(({ date, day }) => ({
    day,
    kg: dailyRecords
      .filter((r) => r.date === date && r.period !== 'morning')
      .reduce((sum, r) => sum + Number(r.feedKg || 0), 0),
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
