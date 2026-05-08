import { loadScript } from './loadScript';
import type { PickedCloudFile } from './types';

interface DropboxFile {
  link: string;
  name: string;
  bytes: number;
  isDir: boolean;
}

declare global {
  interface Window {
    Dropbox?: {
      choose: (opts: {
        success: (files: DropboxFile[]) => void;
        cancel?: () => void;
        linkType?: 'preview' | 'direct';
        multiselect?: boolean;
        extensions?: string[];
        folderselect?: boolean;
      }) => void;
    };
  }
}

const DROPBOX_URL = 'https://www.dropbox.com/static/api/2/dropins.js';

export async function pickFromDropbox(): Promise<PickedCloudFile | null> {
  const appKey = import.meta.env.VITE_DROPBOX_APP_KEY;
  if (!appKey) throw new Error('Dropbox: חסר VITE_DROPBOX_APP_KEY');

  await loadScript(DROPBOX_URL, { id: 'dropboxjs', 'data-app-key': appKey });

  const file = await new Promise<DropboxFile | null>((resolve) => {
    window.Dropbox!.choose({
      success: (files) => resolve(files[0] ?? null),
      cancel: () => resolve(null),
      linkType: 'direct',
      multiselect: false,
    });
  });

  if (!file) return null;

  const r = await fetch(file.link);
  if (!r.ok) throw new Error(`Dropbox download failed: ${r.status}`);
  const blob = await r.blob();
  const mime = blob.type || 'application/octet-stream';
  return { name: file.name, mime, blob };
}
