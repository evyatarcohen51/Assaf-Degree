-- Per-user Gmail credentials for sending reminder emails.
-- Each user configures their own Gmail address + App Password in the Settings page,
-- and the cron sends each user's reminders through their own Gmail account.
alter table public.settings
  add column if not exists gmail_user text,
  add column if not exists gmail_app_password text;
