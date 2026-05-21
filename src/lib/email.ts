/**
 * Email utility — uses SMTP settings stored in the database.
 * Admin configures host/user/pass from the Settings page.
 * No hardcoded credentials anywhere.
 */
import nodemailer from 'nodemailer';
import { sql } from './db';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  appUrl: string;
  appName: string;
}

async function getSmtpConfig(): Promise<SmtpConfig> {
  const rows = await sql`SELECT key, value FROM settings WHERE key LIKE 'smtp_%' OR key IN ('app_url','app_name')`;
  const cfg: Record<string, string> = {};
  for (const row of rows) cfg[row.key] = row.value;
  return {
    host:    cfg.smtp_host    || 'smtp.gmail.com',
    port:    parseInt(cfg.smtp_port || '587'),
    user:    cfg.smtp_user    || '',
    pass:    cfg.smtp_pass    || '',
    from:    cfg.smtp_from    || 'PTB Tracker <noreply@privatetutoringbali.com>',
    appUrl:  cfg.app_url      || 'http://localhost:3000',
    appName: cfg.app_name     || 'Private Tutoring Bali',
  };
}

function createTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

/** Send welcome email to new parent with a link to set their password */
export async function sendParentWelcome(to: string, parentName: string, token: string) {
  const cfg = await getSmtpConfig();
  const link = `${cfg.appUrl}/set-password?token=${token}`;
  const transport = createTransport(cfg);

  await transport.sendMail({
    from: cfg.from,
    to,
    subject: `Welcome to ${cfg.appName} — Set Your Password`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111827">
        <div style="background:#1a2642;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">${cfg.appName}</h1>
          <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Session Reporting Portal</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;font-size:22px">Hello, ${parentName}! 👋</h2>
          <p style="color:#374151;line-height:1.6">
            Your account has been created at <strong>${cfg.appName}</strong>.
            You can now log in to see session reports for your child.
          </p>
          <p style="color:#374151;line-height:1.6">
            Click the button below to set your password and get started:
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}" style="background:#10B981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
              Set My Password →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px">
            This link expires in 48 hours. If you didn't expect this email, you can ignore it.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            ${cfg.appName} · <a href="https://privatetutoringbali.com" style="color:#10B981">privatetutoringbali.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

/** Notify parent that a report has been approved and is ready to view */
export async function sendReportApprovedNotification(
  to: string,
  parentName: string,
  studentName: string,
  reportId: number,
  sessionDate: string,
  topic?: string
) {
  const cfg = await getSmtpConfig();
  const link = `${cfg.appUrl}/report/${reportId}`;
  const transport = createTransport(cfg);
  const dateStr = new Date(sessionDate + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  await transport.sendMail({
    from: cfg.from,
    to,
    subject: `New Session Report for ${studentName} — ${dateStr}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111827">
        <div style="background:#1a2642;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">${cfg.appName}</h1>
          <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Session Reporting Portal</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;font-size:22px">Hello, ${parentName}! 👋</h2>
          <p style="color:#374151;line-height:1.6">
            A new session report for <strong>${studentName}</strong> is now available.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0">
            <p style="margin:0 0 6px;color:#166534;font-weight:600">📋 Session Summary</p>
            <p style="margin:0;color:#374151;font-size:14px">Date: ${dateStr}</p>
            ${topic ? `<p style="margin:4px 0 0;color:#374151;font-size:14px">Topic: ${topic}</p>` : ''}
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}" style="background:#10B981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
              View Full Report →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px">
            You can also download this report as a PDF from the report page.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            ${cfg.appName} · <a href="https://privatetutoringbali.com" style="color:#10B981">privatetutoringbali.com</a>
          </p>
        </div>
      </div>
    `,
  });
}
