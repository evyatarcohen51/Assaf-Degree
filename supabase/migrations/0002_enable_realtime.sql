-- Enable Realtime change feeds for all app tables.
-- Run this in Supabase Dashboard → SQL Editor.
--
-- Without this, INSERT/UPDATE/DELETE events do NOT push to subscribed clients,
-- so adding a row in one tab/device wouldn't reflect in another (or even the
-- same component) until a manual refetch.

alter publication supabase_realtime add table
  public.settings,
  public.profile,
  public.years,
  public.semesters,
  public.subjects,
  public.homework,
  public.schedule_slots,
  public.files,
  public.notes,
  public.recent_files,
  public.deadlines;
