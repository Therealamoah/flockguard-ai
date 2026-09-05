// Rule-based stand-in for the real anomaly detector. The backend/AI team
// will replace this with a trained model — keep the call shape
// (record, flock, priorRecords, fullDetection) -> { flagged, reasons }
// stable so swapping it out doesn't touch the UI.

const MORTALITY_RATE_THRESHOLD = 0.3; // % of flock in a single day
const FEED_DROP_THRESHOLD = 8; // % below the flock's recent average
const UNEATEN_THRESHOLD = 20; // % of the morning's given feed/water left unconsumed by evening
const TEMP_RANGE = [24, 31]; // °C
const HUMIDITY_RANGE = [50, 72]; // %

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// fullDetection gates everything except the mortality check -- Free plan
// still catches the single most safety-critical signal, but the broader
// pattern detection (feed trend, house conditions, behavior, and the
// morning-vs-evening consumption gap) is a paid feature, matching what the
// pricing page actually promises.
//
// morningRecord is this same flock's morning check-in for today, if one was
// logged (feedKg/waterL there mean "given", not "eaten/taken" -- see
// LogRecordModal) -- comparing it against tonight's evening reading catches
// a flock going off feed/water before it shows up as anything else.
export function detectAnomaly({ record, flock, priorRecords = [], morningRecord = null, fullDetection = true }) {
  const reasons = [];

  if (flock?.birds) {
    const mortalityRate = (record.mortality / flock.birds) * 100;
    if (mortalityRate > MORTALITY_RATE_THRESHOLD) {
      reasons.push(`Mortality ${mortalityRate.toFixed(2)}% today — above the ${MORTALITY_RATE_THRESHOLD}% single-day threshold`);
    }
  }

  if (!fullDetection) {
    return { flagged: reasons.length > 0, reasons };
  }

  if (morningRecord?.feedKg > 0 && record.feedKg < morningRecord.feedKg * (1 - UNEATEN_THRESHOLD / 100)) {
    const uneaten = Math.round((1 - record.feedKg / morningRecord.feedKg) * 100);
    reasons.push(`Only ${100 - uneaten}% of the ${morningRecord.feedKg}kg feed given this morning was eaten by evening`);
  }

  if (morningRecord?.waterL > 0 && record.waterL < morningRecord.waterL * (1 - UNEATEN_THRESHOLD / 100)) {
    const untaken = Math.round((1 - record.waterL / morningRecord.waterL) * 100);
    reasons.push(`Only ${100 - untaken}% of the ${morningRecord.waterL}L water given this morning was taken by evening`);
  }

  const recentFeed = average(priorRecords.slice(0, 5).map((r) => r.feedKg));
  if (recentFeed && record.feedKg < recentFeed * (1 - FEED_DROP_THRESHOLD / 100)) {
    const drop = Math.round((1 - record.feedKg / recentFeed) * 100);
    reasons.push(`Feed intake down ${drop}% from this flock's recent average`);
  }

  if (typeof record.temperature === 'number' && (record.temperature < TEMP_RANGE[0] || record.temperature > TEMP_RANGE[1])) {
    reasons.push(`Temperature ${record.temperature}°C outside the ${TEMP_RANGE[0]}–${TEMP_RANGE[1]}°C target range`);
  }

  if (typeof record.humidity === 'number' && (record.humidity < HUMIDITY_RANGE[0] || record.humidity > HUMIDITY_RANGE[1])) {
    reasons.push(`Humidity ${record.humidity}% outside the ${HUMIDITY_RANGE[0]}–${HUMIDITY_RANGE[1]}% target range`);
  }

  if (record.behavior && record.behavior !== 'normal') {
    reasons.push(`Unusual behavior observed: ${record.behavior.replace('_', ' ')}`);
  }

  return { flagged: reasons.length > 0, reasons };
}
