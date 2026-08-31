import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './authStore';
import { detectAnomaly } from '../lib/anomalyRules';
import { BEHAVIOR_LABELS } from '../lib/status';
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
    evidence: row.evidence_url ? { name: row.evidence_url } : null,
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

  const [flocks, setFlocks] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reports, setReports] = useState([]);
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
        setLoading(false);
        return;
      }

      setLoading(true);
      const [flocksRes, recordsRes, alertsRes, recsRes, reportsRes] = await Promise.all([
        supabase.from('flocks').select('*').eq('farm_id', farmId),
        supabase.from('daily_records').select('*').eq('farm_id', farmId).order('record_date', { ascending: false }),
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
      ]);

      if (cancelled) return;

      setFlocks((flocksRes.data ?? []).map(mapFlockRow));
      setDailyRecords((recordsRes.data ?? []).map(mapDailyRecordRow));
      setAlerts((alertsRes.data ?? []).map(mapAlertRow));
      setRecommendations((recsRes.data ?? []).map(mapRecommendationRow));
      setReports((reportsRes.data ?? []).map(mapReportRow));
      setLoading(false);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, farmId]);

  const flocksDisplay = useMemo(() => flocks.map((f) => deriveFlock(f, dailyRecords)), [flocks, dailyRecords]);
  const flocksById = useMemo(() => Object.fromEntries(flocksDisplay.map((f) => [f.id, f])), [flocksDisplay]);

  const totalBirds = useMemo(() => flocksDisplay.reduce((sum, f) => sum + f.birds, 0), [flocksDisplay]);
  const healthyCount = flocksDisplay.filter((f) => f.status === 'healthy').length;
  const attentionCount = flocksDisplay.filter((f) => f.status === 'attention').length;
  const riskDistribution = useMemo(() => deriveRiskDistribution(flocksDisplay), [flocksDisplay]);
  const feedConsumption7d = useMemo(() => deriveFeedConsumption7d(dailyRecords), [dailyRecords]);
  const healthMetrics = useMemo(() => deriveHealthMetrics(flocksDisplay, dailyRecords), [flocksDisplay, dailyRecords]);

  async function addDailyRecord(input) {
    const flock = flocksById[input.flockId];
    const priorRecords = dailyRecords.filter((r) => r.flockId === input.flockId);
    const { flagged, reasons } = detectAnomaly({ record: input, flock, priorRecords });

    const { data, error } = await supabase
      .from('daily_records')
      .insert({
        flock_id: input.flockId,
        farm_id: farmId,
        feed_kg: input.feedKg,
        water_l: input.waterL,
        mortality: input.mortality,
        egg_count: input.eggCount,
        weight_gain_g: input.weightGainG,
        temperature: input.temperature,
        humidity: input.humidity,
        behavior: input.behavior,
        notes: input.notes,
        evidence_url: input.evidence?.name ?? null,
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
    }
  }

  async function addFlock(input) {
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

  const pendingVerification = dailyRecords.filter((r) => r.flagged && r.verified === 'pending');

  const value = {
    flocks: flocksDisplay,
    flocksById,
    dailyRecords,
    alerts,
    recommendations,
    reports,
    pendingVerification,
    totalBirds,
    healthyCount,
    attentionCount,
    riskDistribution,
    feedConsumption7d,
    healthMetrics,
    loading,
    addFlock,
    addDailyRecord,
    verifyRecord,
  };

  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}
