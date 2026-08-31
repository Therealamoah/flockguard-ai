import { Router } from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';
import { TEAM_LIMIT } from '../planPrices.js';
import { sendInviteEmail } from '../lib/mailer.js';

const router = Router();
const INVITE_TTL_DAYS = 7;

// Only an owner or manager can invite -- staff can't grow the team.
router.post('/invite', requireFarmerAuth, async (req, res) => {
  try {
    if (!['owner', 'manager'].includes(req.role)) {
      return res.status(403).json({ error: 'Only an owner or manager can invite teammates' });
    }

    const { email, role } = req.body;
    if (!email || !['manager', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'A valid email and role are required' });
    }

    const [{ data: farm, error: farmErr }, { count, error: countErr }, { data: inviter }] = await Promise.all([
      supabaseAdmin.from('farms').select('name, plan').eq('id', req.farmId).single(),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('farm_id', req.farmId),
      supabaseAdmin.from('profiles').select('name').eq('id', req.userId).single(),
    ]);
    if (farmErr) throw farmErr;
    if (countErr) throw countErr;

    const limit = TEAM_LIMIT[farm.plan] ?? 1;
    if (count >= limit) {
      return res.status(403).json({ error: `Your ${farm.plan} plan allows up to ${limit === Infinity ? 'unlimited' : limit} team members` });
    }

    const { data: existing } = await supabaseAdmin
      .from('invites')
      .select('id')
      .eq('farm_id', req.farmId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'There is already a pending invite for that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabaseAdmin.from('invites').insert({
      farm_id: req.farmId,
      email,
      role,
      invited_by: req.userId,
      token,
      expires_at: expiresAt,
    });
    if (insertErr) throw insertErr;

    await sendInviteEmail({
      to: email,
      inviterName: inviter?.name ?? 'A teammate',
      farmName: farm.name,
      role,
      acceptUrl: `${process.env.FRONTEND_URL}/accept-invite?token=${token}`,
    });

    await supabaseAdmin.from('activity_log').insert({
      farm_id: req.farmId,
      type: 'team',
      text: `New team member invited — ${email}`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invites', requireFarmerAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('invites')
    .select('id, email, role, status, expires_at, created_at')
    .eq('farm_id', req.farmId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Re-sends the same invite link and pushes its expiry out another 7 days --
// for when the original email got lost, buried, or the link expired before
// anyone clicked it.
router.post('/invite/:id/resend', requireFarmerAuth, async (req, res) => {
  try {
    if (!['owner', 'manager'].includes(req.role)) {
      return res.status(403).json({ error: 'Only an owner or manager can resend invites' });
    }

    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (inviteErr || !invite) return res.status(404).json({ error: 'Invite not found' });
    // Must belong to the caller's own farm -- never resend on someone else's behalf.
    if (invite.farm_id !== req.farmId) return res.status(403).json({ error: 'Not your invite to resend' });
    if (invite.status !== 'pending') return res.status(400).json({ error: 'This invite is no longer pending' });

    const [{ data: farm, error: farmErr }, { data: inviter }] = await Promise.all([
      supabaseAdmin.from('farms').select('name').eq('id', req.farmId).single(),
      supabaseAdmin.from('profiles').select('name').eq('id', req.userId).single(),
    ]);
    if (farmErr) throw farmErr;

    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error: updateErr } = await supabaseAdmin.from('invites').update({ expires_at: expiresAt }).eq('id', invite.id);
    if (updateErr) throw updateErr;

    await sendInviteEmail({
      to: invite.email,
      inviterName: inviter?.name ?? 'A teammate',
      farmName: farm.name,
      role: invite.role,
      acceptUrl: `${process.env.FRONTEND_URL}/accept-invite?token=${invite.token}`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public -- the invitee doesn't have an account yet, so no auth here.
router.get('/invite/:token', async (req, res) => {
  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .select('email, role, status, expires_at, farms(name)')
    .eq('token', req.params.token)
    .single();

  if (error || !invite) return res.status(404).json({ error: 'Invite not found' });
  if (invite.status !== 'pending') return res.status(410).json({ error: 'This invite has already been used' });
  if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ error: 'This invite has expired' });

  res.json({ email: invite.email, role: invite.role, farmName: invite.farms?.name ?? '' });
});

router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('token', token)
      .single();
    if (inviteErr || !invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(410).json({ error: 'This invite has already been used' });
    if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ error: 'This invite has expired' });

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      // Tells the handle_new_user trigger to skip its normal "create a
      // brand new farm" path -- this profile gets inserted explicitly,
      // right below, scoped to the farm from the invite instead.
      user_metadata: { invited: true },
    });
    if (createErr) throw createErr;

    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: created.user.id,
      farm_id: invite.farm_id,
      name,
      role: invite.role,
    });
    if (profileErr) throw profileErr;

    await supabaseAdmin.from('invites').update({ status: 'accepted' }).eq('id', invite.id);

    res.json({ success: true, email: invite.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
