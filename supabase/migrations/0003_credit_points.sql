-- Add credit_points to courses (subjects). Used to weight each course in the GPA calculation.
-- Run in Supabase Dashboard → SQL Editor.

alter table public.subjects
  add column if not exists credit_points numeric(4, 2) not null default 0;
