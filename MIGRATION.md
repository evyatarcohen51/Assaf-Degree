# Migrating Got Schooled to Supabase + Vercel

## Complexity: Moderate, ~3–5 days

Vercel part alone is trivial (~30 min). Supabase sync is the real work.

## Tasks

### Vercel deploy (30 min)
1. Push repo to GitHub
2. Import to Vercel, set env vars, deploy

### Supabase setup (half day)
3. Create Supabase project
4. Create 11 tables mirroring Dexie schema (settings, profile, years, semesters, subjects, homework, scheduleSlots, files, notes, recentFiles, deadlines)
5. Create Storage bucket for file blobs + profile pictures
6. Add RLS policies: `user_id = auth.uid()` on every table
7. Create Assaf's user account

### Schema changes (half day)
8. Add `updatedAt` and `deletedAt` columns to every Dexie table
9. Bump Dexie version to v2 with migration
10. Replace `blob` field on files/profile with `storagePath`

### Auth (2 hrs)
11. Add `@supabase/supabase-js`
12. Login screen on first launch, persist session

### Sync engine (2 days — the hard part)
13. Add `pendingSync` outbox table in Dexie
14. Hook `db.table.hook('creating'|'updating'|'deleting')` for all 11 tables to enqueue ops
15. Push worker: drain outbox to Supabase when online
16. Pull worker: on boot + every N minutes, fetch remote changes since last sync, apply to Dexie
17. Last-write-wins by `updatedAt`

### Files (half day)
18. Upload blobs to Supabase Storage on create
19. Fetch via signed URL when opening (cache locally)

### Testing (1 day)
20. Offline write → goes online → syncs
21. Two devices → edits on one show on the other
22. Conflict: same row edited offline on both devices

That's it. ~22 discrete tasks, mostly mechanical except the sync engine.
