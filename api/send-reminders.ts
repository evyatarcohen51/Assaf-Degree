// Vercel serverless function that fires email reminders for due deadlines.
// Triggered daily by Vercel Cron (see vercel.json). Also reachable manually
// for testing: GET /api/send-reminders.
//
// Each user configures their own Gmail credentials in the Settings page;
// reminders for that user are sent through their own Gmail SMTP account.
//
// Env vars required (set in Vercel + .env.local):
//   SUPABASE_URL                    — same value as VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY       — admin key, NEVER expose to the browser

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface DeadlineRow {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  date: string;
  kind: 'exam' | 'assignment' | 'other';
  reminder_email_at: string;
  reminder_recurring_days: number | null;
  reminder_sent_at: string | null;
}

const KIND_HE: Record<DeadlineRow['kind'], string> = {
  exam: 'מבחן',
  assignment: 'מטלה',
  other: 'אחר',
};

function fmtDateHe(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function sendEmail(
  gmailUser: string,
  gmailPass: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });
  await transporter.sendMail({ from: gmailUser, to, subject, html });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const nowIso = new Date().toISOString();

  // 1. Pull due reminders (one-time not yet sent OR any recurring that's due)
  const { data: deadlines, error: e1 } = await supabase
    .from('deadlines')
    .select('*')
    .lte('reminder_email_at', nowIso)
    .not('reminder_email_at', 'is', null);
  if (e1) return res.status(500).json({ error: e1.message });

  const due = (deadlines ?? []).filter(
    (d: DeadlineRow) =>
      d.reminder_sent_at == null || d.reminder_recurring_days != null,
  );

  if (due.length === 0) {
    return res.status(200).json({ ok: true, sent: 0 });
  }

  // 2. Fetch profile, settings (for Gmail creds), and subject names in batch
  const userIds = Array.from(new Set(due.map((d) => d.user_id)));
  const [{ data: profiles }, { data: userSettings }] = await Promise.all([
    supabase.from('profile').select('user_id, email, name').in('user_id', userIds),
    supabase
      .from('settings')
      .select('user_id, gmail_user, gmail_app_password')
      .in('user_id', userIds),
  ]);
  const subjectIds = Array.from(new Set(due.map((d) => d.subject_id)));
  const { data: subjects } = await supabase
    .from('subjects')
    .select('user_id, id, name')
    .in('id', subjectIds);

  const profileByUser = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  const settingsByUser = new Map((userSettings ?? []).map((s) => [s.user_id, s]));
  const subjectKey = (uid: string, sid: string) => `${uid}::${sid}`;
  const subjectByKey = new Map(
    (subjects ?? []).map((s) => [subjectKey(s.user_id, s.id), s]),
  );

  // 3. Send + advance/mark sent
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const d of due as DeadlineRow[]) {
    const profile = profileByUser.get(d.user_id);
    if (!profile?.email) {
      results.push({ id: d.id, ok: false, error: 'no email on profile' });
      continue;
    }
    const userGmail = settingsByUser.get(d.user_id);
    if (!userGmail?.gmail_user || !userGmail?.gmail_app_password) {
      results.push({ id: d.id, ok: false, error: 'no gmail configured' });
      continue;
    }
    const subj = subjectByKey.get(subjectKey(d.user_id, d.subject_id));
    const subjectName = subj?.name ?? '';

    const subject = `[Got Schooled] תזכורת: ${d.title}`;
    const html = `
      <div dir="rtl" style="font-family: system-ui, -apple-system, sans-serif; padding: 16px;">
        <h2 style="margin: 0 0 8px;">תזכורת: ${escapeHtml(d.title)}</h2>
        <p>סוג: ${KIND_HE[d.kind] ?? d.kind}</p>
        ${subjectName ? `<p>קורס: ${escapeHtml(subjectName)}</p>` : ''}
        <p>בתאריך: <strong>${fmtDateHe(d.date)}</strong></p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 12px; color: #666;">
          ${profile.name ? `שלום ${escapeHtml(profile.name)}, ` : ''}תזכורת זו נשלחה אוטומטית ע"י Got Schooled.
        </p>
      </div>
    `;

    try {
      await sendEmail(userGmail.gmail_user, userGmail.gmail_app_password, profile.email, subject, html);

      let updateFields: Partial<DeadlineRow>;
      if (d.reminder_recurring_days != null) {
        const next = new Date(d.reminder_email_at);
        next.setUTCDate(next.getUTCDate() + d.reminder_recurring_days);
        // If we missed multiple intervals, jump to a future time.
        const nowMs = Date.now();
        while (next.getTime() <= nowMs) {
          next.setUTCDate(next.getUTCDate() + d.reminder_recurring_days);
        }
        updateFields = {
          reminder_email_at: next.toISOString(),
          reminder_sent_at: nowIso,
        };
      } else {
        updateFields = { reminder_sent_at: nowIso };
      }

      const { error: e2 } = await supabase
        .from('deadlines')
        .update(updateFields)
        .eq('user_id', d.user_id)
        .eq('id', d.id);
      if (e2) throw e2;

      results.push({ id: d.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ id: d.id, ok: false, error: msg });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return res.status(200).json({ ok: true, sent, total: results.length, results });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
