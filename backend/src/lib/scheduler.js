import cron from 'node-cron';
import { sendDailySummaries } from './dailySummary.js';

export function startScheduler() {
  const schedule = process.env.DAILY_SUMMARY_CRON || '0 6 * * *'; // 6am daily by default
  const timezone = process.env.CRON_TIMEZONE || 'Africa/Accra';

  cron.schedule(
    schedule,
    async () => {
      try {
        const result = await sendDailySummaries();
        console.log(`[daily-summary] sent to ${result.emailsSent} recipient(s) across ${result.farms} farm(s)`);
      } catch (err) {
        console.error('[daily-summary] failed:', err.message);
      }
    },
    { timezone }
  );

  console.log(`[scheduler] daily summary scheduled: "${schedule}" (${timezone})`);
}
