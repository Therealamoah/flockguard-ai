import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';

const router = Router();

// Farmers only have SELECT/INSERT rights on alerts and recommendations via
// RLS -- not DELETE -- so removing a flock has to run with the service_role
// key, same as payments/team/notifications. alerts reference both flock_id
// and a specific daily_record_id, so they have to go before daily_records
// can be deleted, which have to go before the flock itself.
router.delete('/:id', requireFarmerAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: flock, error: flockErr } = await supabaseAdmin
      .from('flocks')
      .select('id')
      .eq('id', id)
      .eq('farm_id', req.farmId)
      .single();
    if (flockErr || !flock) return res.status(404).json({ error: 'Flock not found' });

    const { error: alertsErr } = await supabaseAdmin.from('alerts').delete().eq('flock_id', id).eq('farm_id', req.farmId);
    if (alertsErr) throw alertsErr;

    const { error: recsErr } = await supabaseAdmin
      .from('recommendations')
      .delete()
      .eq('flock_id', id)
      .eq('farm_id', req.farmId);
    if (recsErr) throw recsErr;

    const { error: recordsErr } = await supabaseAdmin
      .from('daily_records')
      .delete()
      .eq('flock_id', id)
      .eq('farm_id', req.farmId);
    if (recordsErr) throw recordsErr;

    const { error: deleteErr } = await supabaseAdmin.from('flocks').delete().eq('id', id).eq('farm_id', req.farmId);
    if (deleteErr) throw deleteErr;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
