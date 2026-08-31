import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';

const router = Router();

const PLAN_PRICE = { free: 0, pro: 49, enterprise: 199 };

// profiles/farms don't store email -- that lives in Supabase Auth -- so any
// route that needs to show a person's email or "last login" merges it in
// from here.
async function fetchAuthUsersById() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return Object.fromEntries(data.users.map((u) => [u.id, u]));
}

function ownerFor(farmId, profiles, authById) {
  const owner = profiles.find((p) => p.farm_id === farmId && p.role === 'owner') ?? profiles.find((p) => p.farm_id === farmId);
  if (!owner) return { name: '', email: '' };
  return { name: owner.name, email: authById[owner.id]?.email ?? '' };
}

router.get('/overview', async (req, res) => {
  try {
    const [{ data: farms, error: farmsErr }, { data: flocks, error: flocksErr }, { data: alerts, error: alertsErr }, { data: records, error: recordsErr }] =
      await Promise.all([
        supabaseAdmin.from('farms').select('*'),
        supabaseAdmin.from('flocks').select('birds'),
        supabaseAdmin.from('alerts').select('id, created_at'),
        supabaseAdmin.from('daily_records').select('flagged, verified'),
      ]);

    const firstError = farmsErr || flocksErr || alertsErr || recordsErr;
    if (firstError) throw firstError;

    const totalFarms = farms.length;
    const activeFarms = farms.filter((f) => f.status === 'active').length;
    const trialFarms = farms.filter((f) => f.status === 'trial').length;
    const suspendedFarms = farms.filter((f) => f.status === 'suspended').length;
    const mrr = farms.reduce((sum, f) => sum + (f.status === 'suspended' ? 0 : (PLAN_PRICE[f.plan] ?? 0)), 0);
    const totalBirds = flocks.reduce((sum, f) => sum + f.birds, 0);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const alertsThisWeek = alerts.filter((a) => new Date(a.created_at) >= oneWeekAgo).length;

    const flaggedRecords = records.filter((r) => r.flagged);
    const confirmed = flaggedRecords.filter((r) => r.verified === 'confirmed').length;
    const dismissed = flaggedRecords.filter((r) => r.verified === 'dismissed').length;
    const verifiedTotal = confirmed + dismissed;
    const confirmedPct = verifiedTotal ? Math.round((confirmed / verifiedTotal) * 100) : 0;

    res.json({
      totalFarms,
      activeFarms,
      trialFarms,
      suspendedFarms,
      mrr,
      totalBirds,
      alertsThisWeek,
      verificationOutcomes: [
        { key: 'confirmed', label: 'Confirmed', value: confirmedPct },
        { key: 'dismissed', label: 'Dismissed', value: verifiedTotal ? 100 - confirmedPct : 0 },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farms', async (req, res) => {
  try {
    const [{ data: farms, error: farmsErr }, { data: flocks, error: flocksErr }, { data: profiles, error: profilesErr }] = await Promise.all([
      supabaseAdmin.from('farms').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('flocks').select('id, farm_id, birds'),
      supabaseAdmin.from('profiles').select('id, farm_id, name, role'),
    ]);
    const firstError = farmsErr || flocksErr || profilesErr;
    if (firstError) throw firstError;

    const authById = await fetchAuthUsersById();

    const result = farms.map((f) => {
      const farmFlocks = flocks.filter((fl) => fl.farm_id === f.id);
      const owner = ownerFor(f.id, profiles, authById);
      return {
        id: f.id,
        name: f.name,
        owner: owner.name,
        email: owner.email,
        plan: f.plan,
        status: f.status,
        signupDate: f.created_at?.slice(0, 10),
        flockCount: farmFlocks.length,
        birdCount: farmFlocks.reduce((sum, fl) => sum + fl.birds, 0),
        userCount: profiles.filter((p) => p.farm_id === f.id).length,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [{ data: farm, error: farmErr }, { data: profiles, error: usersErr }, { data: flocks, error: flocksErr }, { data: activity }] = await Promise.all(
      [
        supabaseAdmin.from('farms').select('*').eq('id', id).single(),
        supabaseAdmin.from('profiles').select('*').eq('farm_id', id),
        supabaseAdmin.from('flocks').select('*').eq('farm_id', id),
        supabaseAdmin.from('activity_log').select('*').eq('farm_id', id).order('created_at', { ascending: false }).limit(20),
      ]
    );

    if (farmErr) return res.status(404).json({ error: 'Farm not found' });
    if (usersErr || flocksErr) throw usersErr || flocksErr;

    const authById = await fetchAuthUsersById();
    const owner = ownerFor(id, profiles, authById);

    res.json({
      farm: {
        id: farm.id,
        name: farm.name,
        owner: owner.name,
        email: owner.email,
        plan: farm.plan,
        status: farm.status,
        signupDate: farm.created_at?.slice(0, 10),
        flockCount: flocks.length,
        birdCount: flocks.reduce((sum, fl) => sum + fl.birds, 0),
        userCount: profiles.length,
      },
      users: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        email: authById[p.id]?.email ?? '',
        role: p.role,
        lastLogin: authById[p.id]?.last_sign_in_at ?? null,
      })),
      activity: (activity ?? []).map((a) => ({ id: a.id, text: a.text, time: a.created_at })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, role, status, farm_id, farms(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const authById = await fetchAuthUsersById();

    res.json(
      profiles.map((p) => ({
        id: p.id,
        name: p.name,
        email: authById[p.id]?.email ?? '',
        role: p.role,
        status: p.status,
        farmId: p.farm_id,
        farmName: p.farms?.name ?? '',
        lastLogin: authById[p.id]?.last_sign_in_at ?? null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'status must be "active" or "suspended"' });
    }
    const { data, error } = await supabaseAdmin.from('profiles').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/billing', async (req, res) => {
  try {
    const [{ data: farms, error: farmsErr }, { data: profiles, error: profilesErr }] = await Promise.all([
      supabaseAdmin.from('farms').select('*'),
      supabaseAdmin.from('profiles').select('id, farm_id, name, role'),
    ]);
    if (farmsErr || profilesErr) throw farmsErr || profilesErr;
    const authById = await fetchAuthUsersById();

    res.json(
      farms.map((f) => {
        const owner = ownerFor(f.id, profiles, authById);
        return {
          id: f.id,
          name: f.name,
          owner: owner.name,
          plan: f.plan,
          status: f.status,
          price: PLAN_PRICE[f.plan] ?? 0,
        };
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .select('*, farms(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    res.json(
      data.map((a) => ({
        id: a.id,
        type: a.type,
        text: a.text,
        time: a.created_at,
        farmId: a.farm_id,
        farmName: a.farms?.name ?? null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
