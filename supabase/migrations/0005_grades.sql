-- Grades per course (subject). Each grade has a weight (percent), the course
-- final grade is the weighted average, and the GPA across courses uses
-- credit_points as the weight.
--
-- Run in Supabase Dashboard → SQL Editor.

----------------------------------------------------------------
-- 1. ENUM
----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'grade_kind') then
    create type public.grade_kind as enum ('exam', 'assignment', 'project', 'other');
  end if;
end $$;

----------------------------------------------------------------
-- 2. TABLE
----------------------------------------------------------------
create table if not exists public.grades (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  name text not null default '',
  kind public.grade_kind not null default 'other',
  grade numeric(5, 2) not null check (grade >= 0 and grade <= 100),
  weight_percent numeric(5, 2) not null check (weight_percent >= 0 and weight_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create index if not exists grades_subject_idx on public.grades(user_id, subject_id);

drop trigger if exists grades_set_updated_at on public.grades;
create trigger grades_set_updated_at before update on public.grades
  for each row execute function public.set_updated_at();

----------------------------------------------------------------
-- 3. RLS
----------------------------------------------------------------
alter table public.grades enable row level security;
drop policy if exists "owner_select" on public.grades;
drop policy if exists "owner_insert" on public.grades;
drop policy if exists "owner_update" on public.grades;
drop policy if exists "owner_delete" on public.grades;
create policy "owner_select" on public.grades for select using (auth.uid() = user_id);
create policy "owner_insert" on public.grades for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.grades for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on public.grades for delete using (auth.uid() = user_id);

----------------------------------------------------------------
-- 4. Realtime
----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'grades'
  ) then
    alter publication supabase_realtime add table public.grades;
  end if;
end $$;
