-- Topics + files refactor: each course (subject) has a grid of topics, each
-- holding its own file collection. Files now belong to a topic (topic_id),
-- can be marked favorite (is_favorite). Existing files are migrated to a
-- default "כללי" topic per course.
--
-- Run in Supabase Dashboard → SQL Editor.

----------------------------------------------------------------
-- 1. TOPICS TABLE
----------------------------------------------------------------
create table if not exists public.topics (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  name text not null default '',
  color text not null default 'yellow',
  "order" int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create index if not exists topics_subject_idx on public.topics(user_id, subject_id);

drop trigger if exists topics_set_updated_at on public.topics;
create trigger topics_set_updated_at before update on public.topics
  for each row execute function public.set_updated_at();

----------------------------------------------------------------
-- 2. RLS for topics
----------------------------------------------------------------
alter table public.topics enable row level security;
drop policy if exists "owner_select" on public.topics;
drop policy if exists "owner_insert" on public.topics;
drop policy if exists "owner_update" on public.topics;
drop policy if exists "owner_delete" on public.topics;
create policy "owner_select" on public.topics for select using (auth.uid() = user_id);
create policy "owner_insert" on public.topics for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.topics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on public.topics for delete using (auth.uid() = user_id);

----------------------------------------------------------------
-- 3. Realtime
----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'topics'
  ) then
    alter publication supabase_realtime add table public.topics;
  end if;
end $$;

----------------------------------------------------------------
-- 4. FILES — add topic_id + is_favorite
----------------------------------------------------------------
alter table public.files
  add column if not exists topic_id text,
  add column if not exists is_favorite boolean not null default false;

----------------------------------------------------------------
-- 5. Backfill: create "כללי" topic per (user, subject) and link existing files
----------------------------------------------------------------
do $$
declare
  s record;
  default_topic_id text;
begin
  for s in select distinct user_id, id as subject_id from public.subjects loop
    default_topic_id := 'general-' || s.subject_id;
    insert into public.topics (id, user_id, subject_id, name, color, "order")
    values (default_topic_id, s.user_id, s.subject_id, 'כללי', 'yellow', 0)
    on conflict (user_id, id) do nothing;

    update public.files
    set topic_id = default_topic_id
    where user_id = s.user_id
      and subject_id = s.subject_id
      and topic_id is null;
  end loop;
end $$;

----------------------------------------------------------------
-- 6. Optional: enforce topic_id NOT NULL after backfill (only safe once
--    everyone is on the new schema; leave nullable for now)
----------------------------------------------------------------
-- alter table public.files alter column topic_id set not null;
