-- Email reminders for deadlines. A deadline can have a one-time reminder
-- (reminder_email_at + reminder_sent_at IS NULL → fires once, then sent_at set)
-- or a recurring one (reminder_recurring_days IS NOT NULL → after firing,
-- reminder_email_at is advanced by N days).
--
-- Run in Supabase Dashboard → SQL Editor.

alter table public.deadlines
  add column if not exists reminder_email_at timestamptz,
  add column if not exists reminder_recurring_days int,
  add column if not exists reminder_sent_at timestamptz;

-- Partial index to make the cron query fast: it only ever scans pending reminders.
create index if not exists deadlines_reminder_pending_idx
  on public.deadlines(reminder_email_at)
  where reminder_email_at is not null
    and (reminder_sent_at is null or reminder_recurring_days is not null);
