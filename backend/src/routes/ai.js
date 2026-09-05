import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';
import { classifyRecord, generateRecommendation } from '../lib/ai.js';

const router = Router();

// Pro/Enterprise only (the frontend only calls this when
// currentPlan.capabilities.fullDetection is true -- Free stays on the free,
// client-side rule-based check). Runs the real AI classification, then
// saves the record with the result already attached -- same shape a
// client-side detectAnomaly() call would have produced.
router.post('/classify-and-save-record', requireFarmerAuth, async (req, res) => {
  try {
    const input = req.body;
    if (!input.flockId) return res.status(400).json({ error: 'flockId is required' });

    const today = new Date().toISOString().slice(0, 10);

    const [{ data: flock, error: flockErr }, { data: priorRows, error: priorErr }, { data: morningRow, error: morningErr }] =
      await Promise.all([
        supabaseAdmin.from('flocks').select('*').eq('id', input.flockId).eq('farm_id', req.farmId).single(),
        supabaseAdmin
          .from('daily_records')
          .select('record_date, feed_kg, water_l, mortality')
          .eq('flock_id', input.flockId)
          .eq('period', 'evening')
          .order('record_date', { ascending: false })
          .limit(5),
        // This same flock's morning check-in for today, if one was logged --
        // its feed_kg/water_l mean "given", not "eaten/taken" like this
        // evening record, so classifyRecord treats it separately.
        supabaseAdmin
          .from('daily_records')
          .select('feed_kg, water_l')
          .eq('flock_id', input.flockId)
          .eq('period', 'morning')
          .eq('record_date', today)
          .maybeSingle(),
      ]);
    if (flockErr || !flock) return res.status(404).json({ error: 'Flock not found' });
    if (priorErr) throw priorErr;
    if (morningErr) throw morningErr;

    const priorRecords = (priorRows ?? []).map((r) => ({
      date: r.record_date,
      feedKg: Number(r.feed_kg),
      waterL: Number(r.water_l),
      mortality: r.mortality,
    }));

    const morningRecord = morningRow ? { feedKg: Number(morningRow.feed_kg), waterL: Number(morningRow.water_l) } : null;

    const { flagged, reasons } = await classifyRecord({
      record: input,
      flock: { name: flock.name, type: flock.type, house: flock.house, birds: flock.birds },
      priorRecords,
      morningRecord,
    });

    const { data, error } = await supabaseAdmin
      .from('daily_records')
      .insert({
        flock_id: input.flockId,
        farm_id: req.farmId,
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

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fires after an alert is confirmed -- generates the "Guide" step content
// and saves it as a real recommendation.
router.post('/generate-recommendation', requireFarmerAuth, async (req, res) => {
  try {
    const { flockId, flockName, message } = req.body;
    if (!flockName || !message) return res.status(400).json({ error: 'flockName and message are required' });

    const rec = await generateRecommendation({ flockName, message });

    const { data, error } = await supabaseAdmin
      .from('recommendations')
      .insert({
        farm_id: req.farmId,
        flock_id: flockId ?? null,
        priority: rec.priority,
        title: rec.title,
        body: rec.body,
      })
      .select('*, flocks(name, type)')
      .single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
