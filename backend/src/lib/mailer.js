import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email is not configured on the server yet (SMTP_* env vars missing)');
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter;
}

export async function sendCriticalAlertEmail({ to, farmName, flockName, message }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `⚠ Critical alert — ${flockName}`,
    html: `
      <p>A critical alert was just confirmed on <strong>${farmName}</strong>:</p>
      <p style="padding:12px;background:#fee;border-left:3px solid #c00;"><strong>${flockName}</strong> — ${message}</p>
      <p><a href="${process.env.FRONTEND_URL}/app/alerts">View it in FlockGuard</a></p>
    `,
  });
}

export async function sendDailySummaryEmail({ to, farmName, stats }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Daily summary — ${farmName}`,
    html: `
      <p>Here's how <strong>${farmName}</strong> is doing:</p>
      <ul>
        <li>${stats.flockCount} flock${stats.flockCount === 1 ? '' : 's'}, ${stats.totalBirds.toLocaleString()} birds</li>
        <li>${stats.recordsLogged} daily record${stats.recordsLogged === 1 ? '' : 's'} logged in the last 24 hours</li>
        <li>${stats.alertsConfirmed} alert${stats.alertsConfirmed === 1 ? '' : 's'} confirmed in the last 24 hours</li>
        ${
          stats.pendingVerification > 0
            ? `<li style="color:#b45309"><strong>${stats.pendingVerification} record${stats.pendingVerification === 1 ? '' : 's'} still awaiting your verification</strong></li>`
            : ''
        }
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/app">Open FlockGuard</a></p>
    `,
  });
}

export async function sendInviteEmail({ to, inviterName, farmName, role, acceptUrl }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${inviterName} invited you to join ${farmName} on FlockGuard`,
    html: `
      <p>${inviterName} invited you to join <strong>${farmName}</strong> on FlockGuard as a <strong>${role}</strong>.</p>
      <p><a href="${acceptUrl}">Accept the invite</a> to set up your account.</p>
      <p style="color:#888;font-size:12px">This link expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
    `,
  });
}
