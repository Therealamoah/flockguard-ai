import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';
import { PLAN_PRICE } from '../planPrices.js';
import { getUsdToGhsRate } from '../lib/exchangeRate.js';

const router = Router();

function ghsKoboFor(planId, rate) {
  const ghsAmount = Math.round(PLAN_PRICE[planId] * rate * 100) / 100;
  return Math.round(ghsAmount * 100); // Paystack amounts are in kobo/pesewas
}

// The frontend asks here first for exactly how much (in GHS) to charge --
// the backend, not the browser, is the source of truth for the live
// exchange rate, so there's no way to hand Paystack a manipulated amount.
router.get('/quote/:planId', requireFarmerAuth, async (req, res) => {
  const planId = (req.params.planId || '').toLowerCase();
  if (!(planId in PLAN_PRICE) || PLAN_PRICE[planId] === 0) {
    return res.status(400).json({ error: 'Invalid paid plan' });
  }

  try {
    const rate = await getUsdToGhsRate();
    const amountInKobo = ghsKoboFor(planId, rate);
    res.json({ planId, usd: PLAN_PRICE[planId], rate, ghs: amountInKobo / 100, amountInKobo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The frontend never gets to just say "payment succeeded" -- it hands us a
// Paystack transaction reference, and we independently ask Paystack whether
// that reference actually paid, and how much (re-deriving the expected GHS
// amount the same way /quote did). Only then do we touch the database, and
// only the caller's own farm (via req.farmId from the auth middleware),
// never whatever farm_id the request body might claim.
router.post('/verify', requireFarmerAuth, async (req, res) => {
  const { reference, planId } = req.body;
  const normalizedPlan = (planId || '').toLowerCase();

  if (!reference || !(normalizedPlan in PLAN_PRICE) || PLAN_PRICE[normalizedPlan] === 0) {
    return res.status(400).json({ error: 'A payment reference and a paid planId are required' });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Payments are not configured on the server yet' });
  }

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment could not be verified' });
    }

    // Small tolerance for exchange-rate drift between the /quote call and
    // this one (they can straddle the cache refresh) -- not for anything
    // else, the currency and math are otherwise exact.
    const rate = await getUsdToGhsRate();
    const expectedKobo = ghsKoboFor(normalizedPlan, rate);
    const tolerance = 0.05;

    if (verifyData.data.currency !== 'GHS' || verifyData.data.amount < expectedKobo * (1 - tolerance)) {
      return res.status(400).json({ error: 'Amount paid does not match the selected plan' });
    }

    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .update({ plan: normalizedPlan })
      .eq('id', req.farmId)
      .select('name')
      .single();
    if (error) throw error;

    // Best-effort -- the payment already succeeded and the plan is already
    // updated, so a logging hiccup here shouldn't fail the whole request.
    await supabaseAdmin.from('activity_log').insert({
      farm_id: req.farmId,
      type: 'billing',
      text: `Upgraded to ${normalizedPlan[0].toUpperCase() + normalizedPlan.slice(1)} — ${farm?.name ?? ''}`,
    });

    res.json({ success: true, plan: normalizedPlan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
