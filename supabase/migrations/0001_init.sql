-- Got Schooled — initial schema
-- Run this in Supabase Dashboard → SQL Editor.
-- Single-user-per-account model. All rows scoped by user_id; RLS enforces ownership.

----------------------------------------------------------------
-- 1. ENUMS
----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'homework_status') then
    create type public.homework_status as enum ('pending', 'in_progress', 'done');
  end if;
  if not exists (select 1 from pg_type where typname = 'deadline_kind') then
    create type public.deadline_kind as enum ('exam', 'assignment', 'other');
  end if;
end $$;

----------------------------------------------------------------
-- 2. updated_at trigger helper
----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

----------------------------------------------------------------
-- 3. TABLES
----------------------------------------------------------------

-- settings: singleton-per-user (id = 'app')
create table if not exists public.settings (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  institution_name text not null default '',
  current_year_id text,
  current_semester_id text,
  bootstrapped boolean not null default false,
  must_change_password boolean not null default false,
  updated_at timestamptz not null default now()
);
drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- profile: singleton-per-user
create table if not exists public.profile (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  birth_date date,
  picture_path text,
  picture_mime text,
  updated_at timestamptz not null default now()
);
drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

create table if not exists public.years (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  "order" int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
drop trigger if exists years_set_updated_at on public.years;
create trigger years_set_updated_at before update on public.years
  for each row execute function public.set_updated_at();

create table if not exists public.semesters (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  year_id text not null,
  label text not null default '',
  start_date date,
  end_date date,
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, year_id) references public.years(user_id, id) on delete cascade
);
drop trigger if exists semesters_set_updated_at on public.semesters;
create trigger semesters_set_updated_at before update on public.semesters
  for each row execute function public.set_updated_at();
create index if not exists semesters_year_idx on public.semesters(user_id, year_id);

create table if not exists public.subjects (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id text not null,
  name text not null default '',
  color text,
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, semester_id) references public.semesters(user_id, id) on delete cascade
);
drop trigger if exists subjects_set_updated_at on public.subjects;
create trigger subjects_set_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();
create index if not exists subjects_semester_idx on public.subjects(user_id, semester_id);

create table if not exists public.homework (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  task text not null default '',
  status public.homework_status not null default 'pending',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
drop trigger if exists homework_set_updated_at on public.homework;
create trigger homework_set_updated_at before update on public.homework
  for each row execute function public.set_updated_at();
create index if not exists homework_subject_idx on public.homework(user_id, subject_id);
create index if not exists homework_status_idx on public.homework(user_id, status);

create table if not exists public.schedule_slots (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id text not null,
  subject_id text not null,
  weekday int not null check (weekday between 0 and 6),
  start_minutes int not null check (start_minutes >= 0 and start_minutes < 1440),
  end_minutes int not null check (end_minutes > 0 and end_minutes <= 1440),
  room text,
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, semester_id) references public.semesters(user_id, id) on delete cascade,
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
drop trigger if exists schedule_slots_set_updated_at on public.schedule_slots;
create trigger schedule_slots_set_updated_at before update on public.schedule_slots
  for each row execute function public.set_updated_at();
create index if not exists schedule_slots_semester_weekday_idx on public.schedule_slots(user_id, semester_id, weekday);

create table if not exists public.files (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  name text not null,
  mime_type text not null default 'application/octet-stream',
  size bigint not null default 0,
  storage_path text not null,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at before update on public.files
  for each row execute function public.set_updated_at();
create index if not exists files_subject_idx on public.files(user_id, subject_id);

create table if not exists public.notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

create table if not exists public.recent_files (
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id text not null,
  opened_at timestamptz not null default now(),
  primary key (user_id, file_id),
  foreign key (user_id, file_id) references public.files(user_id, id) on delete cascade
);
create index if not exists recent_files_opened_at_idx on public.recent_files(user_id, opened_at desc);

create table if not exists public.deadlines (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  title text not null default '',
  date date not null,
  kind public.deadline_kind not null default 'other',
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
drop trigger if exists deadlines_set_updated_at on public.deadlines;
create trigger deadlines_set_updated_at before update on public.deadlines
  for each row execute function public.set_updated_at();
create index if not exists deadlines_date_idx on public.deadlines(user_id, date);

----------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
----------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'settings', 'profile', 'years', 'semesters', 'subjects',
    'homework', 'schedule_slots', 'files', 'notes', 'recent_files', 'deadlines'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "owner_select" on public.%I;', t);
    execute format('drop policy if exists "owner_insert" on public.%I;', t);
    execute format('drop policy if exists "owner_update" on public.%I;', t);
    execute format('drop policy if exists "owner_delete" on public.%I;', t);
    execute format($f$create policy "owner_select" on public.%I for select using (auth.uid() = user_id);$f$, t);
    execute format($f$create policy "owner_insert" on public.%I for insert with check (auth.uid() = user_id);$f$, t);
    execute format($f$create policy "owner_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);$f$, t);
    execute format($f$create policy "owner_delete" on public.%I for delete using (auth.uid() = user_id);$f$, t);
  end loop;
end $$;

----------------------------------------------------------------
-- 5. STORAGE BUCKET + POLICIES
----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false)
on conflict (id) do nothing;

drop policy if exists "owner_select_files" on storage.objects;
drop policy if exists "owner_insert_files" on storage.objects;
drop policy if exists "owner_update_files" on storage.objects;
drop policy if exists "owner_delete_files" on storage.objects;

-- Path convention: <user_id>/<file_id>
create policy "owner_select_files" on storage.objects for select
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_insert_files" on storage.objects for insert
  with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_update_files" on storage.objects for update
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_delete_files" on storage.objects for delete
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

----------------------------------------------------------------
-- 6. AUTO-CREATE settings + profile rows on signup
----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.settings (user_id, must_change_password)
  values (new.id, true)
  on conflict (user_id) do nothing;

  insert into public.profile (user_id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

----------------------------------------------------------------
-- 7. Backfill: ensure existing users have settings + profile rows
----------------------------------------------------------------
insert into public.settings (user_id, must_change_password)
select id, true from auth.users
on conflict (user_id) do nothing;

insert into public.profile (user_id, email)
select id, coalesce(email, '') from auth.users
on conflict (user_id) do nothing;
