import { supabaseAdmin } from '../supabaseAdmin.js';
import { sendDailySummaryEmail } from './mailer.js';

// Runs once a day via the scheduler (or can be called directly for
// testing) -- gathers real per-farm stats for the last 24 hours and emails
// every subscribed profile, grouped by farm so each farm's stats are only
// computed once no matter how many teammates on it are subscribed.
export async function sendDailySummaries() {
  const { data: subscribers, error } = await supabaseAdmin
    .from('profiles')
    .select('id, farm_id')
    .eq('notify_daily_summary', true);
  if (error) throw error;
  if (!subscribers?.length) return { farms: 0, emailsSent: 0 };

  const farmIds = [...new Set(subscribers.map((s) => s.farm_id))];
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
  if (authErr) throw authErr;
  const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));

  let emailsSent = 0;

  for (const farmId of farmIds) {
    const [{ data: farm }, { data: flocks }, { data: records }, { data: alerts }] = await Promise.all([
      supabaseAdmin.from('farms').select('name').eq('id', farmId).single(),
      supabaseAdmin.from('flocks').select('birds').eq('farm_id', farmId),
      supabaseAdmin.from('daily_records').select('flagged, verified').eq('farm_id', farmId).gte('created_at', since),
      supabaseAdmin.from('alerts').select('id').eq('farm_id', farmId).gte('created_at', since),
    ]);

    const stats = {
      flockCount: flocks?.length ?? 0,
      totalBirds: (flocks ?? []).reduce((sum, f) => sum + f.birds, 0),
      recordsLogged: records?.length ?? 0,
      alertsConfirmed: alerts?.length ?? 0,
      pendingVerification: (records ?? []).filter((r) => r.flagged && r.verified === 'pending').length,
    };

    const recipients = subscribers
      .filter((s) => s.farm_id === farmId)
      .map((s) => emailById[s.id])
      .filter(Boolean);

    const results = await Promise.allSettled(
      recipients.map((to) => sendDailySummaryEmail({ to, farmName: farm?.name ?? '', stats }))
    );
    emailsSent += results.filter((r) => r.status === 'fulfilled').length;
  }

  return { farms: farmIds.length, emailsSent };
}
