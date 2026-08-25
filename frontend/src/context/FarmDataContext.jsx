import { useMemo, useState } from 'react';
import {
  flocks as seedFlocks,
  dailyRecords as seedDailyRecords,
  alerts as seedAlerts,
} from '../data/mockData';
import { detectAnomaly } from '../lib/anomalyRules';
import { BEHAVIOR_LABELS } from '../lib/status';
import { FarmDataContext } from './farmDataStore';

function timeNowLabel() {
  return `Today, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export function FarmDataProvider({ children }) {
  const [dailyRecords, setDailyRecords] = useState(seedDailyRecords);
  const [alerts, setAlerts] = useState(seedAlerts);
  const flocks = seedFlocks;

  const flocksById = useMemo(() => Object.fromEntries(flocks.map((f) => [f.id, f])), [flocks]);

  function addDailyRecord(input) {
    const flock = flocksById[input.flockId];
    const priorRecords = dailyRecords.filter((r) => r.flockId === input.flockId);
    const { flagged, reasons } = detectAnomaly({ record: input, flock, priorRecords });

    const record = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...input,
      flagged,
      verified: flagged ? 'pending' : null,
      reasons,
    };

    setDailyRecords((prev) => [record, ...prev]);
    return record;
  }

  function verifyRecord(recordId, decision) {
    const record = dailyRecords.find((r) => r.id === recordId);
    if (!record) return;

    setDailyRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, verified: decision } : r)));

    if (decision === 'confirmed') {
      const flock = flocksById[record.flockId];
      setAlerts((prev) => [
        {
          id: `verified-alert-${recordId}`,
          flockId: record.flockId,
          flockName: `${flock.name} — ${flock.type}`,
          house: flock.house,
          severity: 'critical',
          message: record.reasons[0] ?? `Unusual behavior: ${BEHAVIOR_LABELS[record.behavior] ?? record.behavior}`,
          time: timeNowLabel(),
        },
        ...prev,
      ]);
    }
  }

  const pendingVerification = dailyRecords.filter((r) => r.flagged && r.verified === 'pending');

  const value = {
    flocks,
    flocksById,
    dailyRecords,
    alerts,
    pendingVerification,
    addDailyRecord,
    verifyRecord,
  };

  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}
