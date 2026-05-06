import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import { newId } from '../lib/ids';
import type { FileRecord } from '../types/domain';

const BUCKET = 'user-files';
const RECENT_CAP = 10;

export function useFilesByTopic(topicId: string | undefined | null): FileRecord[] {
  const { user } = useAuth();
  return (
    useTable<FileRecord[]>(
      'files',
      async () => {
        if (!user || !topicId) return [];
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .eq('topic_id', topicId)
          .order('added_at', { ascending: false });
        if (error) throw error;
        return data ?? [];
      },
      [topicId],
    ) ?? []
  );
}

export function useFilesBySubject(subjectId: string | undefined | null): FileRecord[] {
  const { user } = useAuth();
  return (
    useTable<FileRecord[]>(
      'files',
      async () => {
        if (!user || !subjectId) return [];
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId)
          .order('added_at', { ascending: false });
        if (error) throw error;
        return data ?? [];
      },
      [subjectId],
    ) ?? []
  );
}

export function useRecentFiles(): {
  recent: { file_id: string; opened_at: string };
  file: FileRecord;
}[] {
  const { user } = useAuth();
  return (
    useTable<{ recent: { file_id: string; opened_at: string }; file: FileRecord }[]>(
      'recent_files',
      async () => {
        if (!user) return [];
        const { data: recents, error: e1 } = await supabase
          .from('recent_files')
          .select('file_id, opened_at')
          .eq('user_id', user.id)
          .order('opened_at', { ascending: false })
          .limit(RECENT_CAP);
        if (e1) throw e1;
        if (!recents || recents.length === 0) return [];
        const ids = recents.map((r) => r.file_id);
        const { data: files, error: e2 } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .in('id', ids);
        if (e2) throw e2;
        const byId = new Map((files ?? []).map((f) => [f.id, f]));
        return recents
          .map((r) => ({ recent: r, file: byId.get(r.file_id) as FileRecord | undefined }))
          .filter((row): row is { recent: typeof row.recent; file: FileRecord } =>
            Boolean(row.file),
          );
      },
    ) ?? []
  );
}

export async function addFile(
  user_id: string,
  subjectId: string,
  topicId: string,
  file: File,
): Promise<string> {
  const id = newId();
  const path = `${user_id}/${id}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (upErr) throw upErr;
  const { error } = await supabase.from('files').insert({
    id,
    user_id,
    subject_id: subjectId,
    topic_id: topicId,
    name: file.name,
    mime_type: file.type || 'application/octet-stream',
    size: file.size,
    storage_path: path,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return id;
}

export async function getSignedUrl(path: string, expiresInSeconds = 60): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadFile(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw error;
  return data;
}

export async function touchRecent(user_id: string, fileId: string) {
  await supabase
    .from('recent_files')
    .upsert({ user_id, file_id: fileId, opened_at: new Date().toISOString() });
  const { data: all } = await supabase
    .from('recent_files')
    .select('file_id, opened_at')
    .eq('user_id', user_id)
    .order('opened_at', { ascending: false });
  if (all && all.length > RECENT_CAP) {
    const toDelete = all.slice(RECENT_CAP).map((r) => r.file_id);
    await supabase.from('recent_files').delete().eq('user_id', user_id).in('file_id', toDelete);
  }
}

export async function deleteFile(user_id: string, fileId: string, storagePath: string) {
  await supabase.storage.from(BUCKET).remove([storagePath]);
  await supabase.from('files').delete().eq('user_id', user_id).eq('id', fileId);
}

export async function toggleFavorite(user_id: string, fileId: string, isFavorite: boolean) {
  const { error } = await supabase
    .from('files')
    .update({ is_favorite: isFavorite })
    .eq('user_id', user_id)
    .eq('id', fileId);
  if (error) throw error;
}
