import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './authStore';
import { detectAnomaly } from '../lib/anomalyRules';
import { BEHAVIOR_LABELS } from '../lib/status';
import { planFor } from '../data/plans';
import { backendApi } from '../lib/backendApi';
import {
  deriveFlock,
  deriveFeedConsumption7d,
  deriveRiskDistribution,
  deriveHealthMetrics,
} from '../lib/deriveFarmStats';
import { FarmDataContext } from './farmDataStore';

const FLOCK_TYPE_LABEL = { broilers: 'Broilers', layers: 'Layers' };

function mapFlockRow(row) {
  return {
    id: row.id,
    name: row.name,
    type: FLOCK_TYPE_LABEL[row.type] ?? row.type,
    house: row.house,
    birds: row.birds,
    hatchDate: row.hatch_date,
    risk: row.risk,
  };
}

function mapDailyRecordRow(row) {
  return {
    id: row.id,
    date: row.record_date,
    period: row.period,
    flockId: row.flock_id,
    feedKg: Number(row.feed_kg),
    waterL: Number(row.water_l),
    mortality: row.mortality,
    eggCount: row.egg_count,
    weightGainG: row.weight_gain_g,
    temperature: row.temperature != null ? Number(row.temperature) : null,
    humidity: row.humidity != null ? Number(row.humidity) : null,
    behavior: row.behavior,
    notes: row.notes,
    evidence: row.evidence_url ? { url: row.evidence_url } : null,
    flagged: row.flagged,
    verified: row.verified,
    reasons: row.reasons ?? [],
  };
}

function mapAlertRow(row) {
  const flock = row.flocks;
  return {
    id: row.id,
    flockId: row.flock_id,
    flockName: flock ? `${flock.name} — ${FLOCK_TYPE_LABEL[flock.type] ?? flock.type}` : '',
    house: flock?.house ?? '',
    severity: row.severity,
    message: row.message,
    time: new Date(row.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function mapRecommendationRow(row) {
  const flock = row.flocks;
  return {
    id: row.id,
    priority: row.priority,
    flockName: flock ? `${flock.name} — ${FLOCK_TYPE_LABEL[flock.type] ?? flock.type}` : 'All flocks',
    title: row.title,
    body: row.body,
  };
}

function mapReportRow(row) {
  return {
    id: row.id,
    title: row.title,
    period: `${row.period_start} – ${row.period_end}`,
    type: row.type,
    generated: row.generated_at?.slice(0, 10),
  };
}

export function FarmDataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const farmId = user?.farmId;
  const currentPlan = planFor(user?.plan);

  const [flocks, setFlocks] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reports, setReports] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      if (!isAuthenticated || !farmId) {
        if (cancelled) return;
        setFlocks([]);
        setDailyRecords([]);
        setAlerts([]);
        setRecommendations([]);
        setReports([]);
        setTeam([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      let recordsQuery = supabase
        .from('daily_records')
        .select('*')
        .eq('farm_id', farmId)
        .order('record_date', { ascending: false });
      if (Number.isFinite(currentPlan.historyDays)) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - currentPlan.historyDays);
        recordsQuery = recordsQuery.gte('record_date', cutoff.toISOString().slice(0, 10));
      }

      const [flocksRes, recordsRes, alertsRes, recsRes, reportsRes, teamRes] = await Promise.all([
        supabase.from('flocks').select('*').eq('farm_id', farmId),
        recordsQuery,
        supabase
          .from('alerts')
          .select('*, flocks(name, type, house)')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false }),
        supabase
          .from('recommendations')
          .select('*, flocks(name, type)')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false }),
        supabase.from('reports').select('*').eq('farm_id', farmId).order('generated_at', { ascending: false }),
        supabase.from('profiles').select('id, name, role, status').eq('farm_id', farmId).order('created_at', { ascending: true }),
      ]);

      if (cancelled) return;

      setFlocks((flocksRes.data ?? []).map(mapFlockRow));
      setDailyRecords((recordsRes.data ?? []).map(mapDailyRecordRow));
      setAlerts((alertsRes.data ?? []).map(mapAlertRow));
      setRecommendations((recsRes.data ?? []).map(mapRecommendationRow));
      setReports((reportsRes.data ?? []).map(mapReportRow));
      setTeam(teamRes.data ?? []);
      setLoading(false);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
    // currentPlan.historyDays is included so upgrading/downgrading plan
    // immediately re-fetches with the new history window, not just on next
    // page load.
  }, [isAuthenticated, farmId, currentPlan.historyDays]);

  const flocksDisplay = useMemo(() => flocks.map((f) => deriveFlock(f, dailyRecords)), [flocks, dailyRecords]);
  const flocksById = useMemo(() => Object.fromEntries(flocksDisplay.map((f) => [f.id, f])), [flocksDisplay]);

  const totalBirds = useMemo(() => flocksDisplay.reduce((sum, f) => sum + f.birds, 0), [flocksDisplay]);
  const healthyCount = flocksDisplay.filter((f) => f.status === 'healthy').length;
  const attentionCount = flocksDisplay.filter((f) => f.status === 'attention').length;
  const riskDistribution = useMemo(() => deriveRiskDistribution(flocksDisplay), [flocksDisplay]);
  const feedConsumption7d = useMemo(() => deriveFeedConsumption7d(dailyRecords), [dailyRecords]);
  const healthMetrics = useMemo(() => deriveHealthMetrics(flocksDisplay, dailyRecords), [flocksDisplay, dailyRecords]);

  async function addDailyRecord(input) {
    const today = new Date().toISOString().slice(0, 10);

    // Morning check-in: just recording what was given, not a health signal
    // by itself -- no AI call, no rule-based check, same on every plan.
    if (input.period === 'morning') {
      const { data, error } = await supabase
        .from('daily_records')
        .insert({
          flock_id: input.flockId,
          farm_id: farmId,
          record_date: today,
          period: 'morning',
          feed_kg: input.feedKg,
          water_l: input.waterL,
          mortality: 0,
          behavior: 'normal',
        })
        .select()
        .single();

      if (error) throw error;

      const record = mapDailyRecordRow(data);
      setDailyRecords((prev) => [record, ...prev]);
      return record;
    }

    // Evening check-in -- this is what actually gets classified. If this
    // flock has a morning check-in for today, the classifier compares what
    // was given then against what was eaten/taken now.
    const morningRow = dailyRecords.find((r) => r.flockId === input.flockId && r.date === today && r.period === 'morning');
    const morningRecord = morningRow ? { feedKg: morningRow.feedKg, waterL: morningRow.waterL } : null;

    // Pro/Enterprise: real AI classification, run server-side (the API key
    // can't live in the browser) and saved in the same request -- the
    // backend looks up today's morning row itself.
    if (currentPlan.capabilities.fullDetection) {
      const row = await backendApi.post('/api/ai/classify-and-save-record', { ...input, period: 'evening' });
      const record = mapDailyRecordRow(row);
      setDailyRecords((prev) => [record, ...prev]);
      return record;
    }

    // Free: the cheap client-side mortality-only check, no AI call.
    const flock = flocksById[input.flockId];
    const priorRecords = dailyRecords.filter((r) => r.flockId === input.flockId && r.period === 'evening');
    const { flagged, reasons } = detectAnomaly({ record: input, flock, priorRecords, morningRecord, fullDetection: false });

    const { data, error } = await supabase
      .from('daily_records')
      .insert({
        flock_id: input.flockId,
        farm_id: farmId,
        record_date: today,
        period: 'evening',
        feed_kg: input.feedKg,
        water_l: input.waterL,
        mortality: input.mortality,
        egg_count: input.eggCount,
        weight_gain_g: input.weightGainG,
        temperature: input.temperature,
        humidity: input.humidity,
        behavior: input.behavior,
        notes: input.notes,
        evidence_url: input.evidence?.url ?? null,
        flagged,
        verified: flagged ? 'pending' : null,
        reasons,
      })
      .select()
      .single();

    if (error) throw error;

    const record = mapDailyRecordRow(data);
    setDailyRecords((prev) => [record, ...prev]);
    return record;
  }

  async function verifyRecord(recordId, decision) {
    const record = dailyRecords.find((r) => r.id === recordId);
    if (!record) return;

    const { error } = await supabase.from('daily_records').update({ verified: decision }).eq('id', recordId);
    if (error) throw error;

    setDailyRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, verified: decision } : r)));

    if (decision === 'confirmed') {
      const message = record.reasons[0] ?? `Unusual behavior: ${BEHAVIOR_LABELS[record.behavior] ?? record.behavior}`;

      const { data, error: alertError } = await supabase
        .from('alerts')
        .insert({
          farm_id: farmId,
          flock_id: record.flockId,
          daily_record_id: recordId,
          severity: 'critical',
          message,
        })
        .select('*, flocks(name, type, house)')
        .single();

      if (alertError) throw alertError;
      setAlerts((prev) => [mapAlertRow(data), ...prev]);

      // A confirmed alert means this flock now has a real, open issue --
      // reflect that in its risk level so Dashboard/Flocks/Health Monitoring
      // stop showing it as healthy.
      await supabase.from('flocks').update({ risk: 'high' }).eq('id', record.flockId);
      setFlocks((prev) => prev.map((f) => (f.id === record.flockId ? { ...f, risk: 'high' } : f)));

      // Best-effort -- the alert already exists, a logging hiccup here
      // shouldn't undo that.
      const flockName = data.flocks ? `${data.flocks.name} — ${data.flocks.house}` : '';
      supabase.from('activity_log').insert({
        farm_id: farmId,
        type: 'alert',
        text: `Alert escalated${flockName ? ` — ${flockName}` : ''}: ${message}`,
      });

      // Best-effort, same reasoning -- the alert already exists regardless
      // of whether the email send succeeds.
      backendApi.post('/api/notifications/critical-alert', { flockName, message }).catch(() => {});

      // Fills in the "Guide" step. Best-effort -- a failed generation
      // shouldn't undo the alert that already exists.
      if (currentPlan.capabilities.recommendations) {
        backendApi
          .post('/api/ai/generate-recommendation', { flockId: record.flockId, flockName, message })
          .then((row) => setRecommendations((prev) => [mapRecommendationRow(row), ...prev]))
          .catch(() => {});
      }
    }
  }

  async function addFlock(input) {
    if (flocks.length >= currentPlan.flockLimit) {
      throw new Error(`Your ${currentPlan.name} plan allows up to ${currentPlan.flockLimit} flocks — upgrade to add more.`);
    }

    const { data, error } = await supabase
      .from('flocks')
      .insert({
        farm_id: farmId,
        name: input.name,
        type: input.type,
        house: input.house,
        birds: input.birds,
        hatch_date: input.hatchDate,
        risk: 'low',
      })
      .select()
      .single();

    if (error) throw error;

    const flock = mapFlockRow(data);
    setFlocks((prev) => [...prev, flock]);
    return flock;
  }

  // Runs server-side (service_role key) -- farmers only have SELECT/INSERT
  // rights on alerts/recommendations via RLS, not DELETE, so this can't be
  // a direct Supabase call the way addFlock is.
  async function deleteFlock(flockId) {
    await backendApi.del(`/api/flocks/${flockId}`);

    setFlocks((prev) => prev.filter((f) => f.id !== flockId));
    setDailyRecords((prev) => prev.filter((r) => r.flockId !== flockId));
    setAlerts((prev) => prev.filter((a) => a.flockId !== flockId));
    setRecommendations((prev) => prev.filter((r) => r.flockId !== flockId));
  }

  const pendingVerification = dailyRecords.filter((r) => r.flagged && r.verified === 'pending');

  const value = {
    currentPlan,
    flocks: flocksDisplay,
    flocksById,
    dailyRecords,
    alerts,
    recommendations,
    reports,
    team,
    pendingVerification,
    totalBirds,
    healthyCount,
    attentionCount,
    riskDistribution,
    feedConsumption7d,
    healthMetrics,
    loading,
    addFlock,
    deleteFlock,
    addDailyRecord,
    verifyRecord,
  };

  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}
