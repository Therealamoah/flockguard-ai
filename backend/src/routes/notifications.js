import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';
import { sendCriticalAlertEmail } from '../lib/mailer.js';

const router = Router();

// Called right after a flagged record is confirmed into a real alert.
// Best-effort from the caller's side (the alert already exists either way)
// -- this only decides who gets emailed about it.
router.post('/critical-alert', requireFarmerAuth, async (req, res) => {
  try {
    const { flockName, message } = req.body;
    if (!flockName || !message) {
      return res.status(400).json({ error: 'flockName and message are required' });
    }

    const [{ data: farm, error: farmErr }, { data: subscribers, error: subErr }] = await Promise.all([
      supabaseAdmin.from('farms').select('name').eq('id', req.farmId).single(),
      supabaseAdmin.from('profiles').select('id').eq('farm_id', req.farmId).eq('notify_critical', true),
    ]);
    if (farmErr) throw farmErr;
    if (subErr) throw subErr;

    if (!subscribers?.length) return res.json({ sent: 0 });

    const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (authErr) throw authErr;
    const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));

    const recipients = subscribers.map((s) => emailById[s.id]).filter(Boolean);

    await Promise.allSettled(
      recipients.map((to) => sendCriticalAlertEmail({ to, farmName: farm.name, flockName, message }))
    );

    res.json({ sent: recipients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
