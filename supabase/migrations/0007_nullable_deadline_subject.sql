-- Allow deadlines without a specific course ("אחר")
alter table public.deadlines alter column subject_id drop not null;
