import { loadScript } from './loadScript';
import type { PickedCloudFile } from './types';

interface OneDriveFile {
  name: string;
  size?: number;
  '@microsoft.graph.downloadUrl'?: string;
  file?: { mimeType?: string };
}

declare global {
  interface Window {
    OneDrive?: {
      open: (opts: {
        clientId: string;
        action: 'download' | 'share' | 'query';
        multiSelect?: boolean;
        advanced?: { redirectUri?: string; filter?: string };
        success: (resp: { value: OneDriveFile[] }) => void;
        cancel?: () => void;
        error?: (e: unknown) => void;
      }) => void;
    };
  }
}

const ONEDRIVE_URL = 'https://js.live.net/v7.2/OneDrive.js';

export async function pickFromOneDrive(): Promise<PickedCloudFile | null> {
  const clientId = import.meta.env.VITE_ONEDRIVE_CLIENT_ID;
  if (!clientId) throw new Error('OneDrive: חסר VITE_ONEDRIVE_CLIENT_ID');

  await loadScript(ONEDRIVE_URL);

  const file = await new Promise<OneDriveFile | null>((resolve, reject) => {
    window.OneDrive!.open({
      clientId,
      action: 'download',
      multiSelect: false,
      advanced: { redirectUri: window.location.origin },
      success: (resp) => resolve(resp.value?.[0] ?? null),
      cancel: () => resolve(null),
      error: (e) => reject(new Error(`OneDrive: ${(e as { message?: string })?.message || String(e)}`)),
    });
  });

  if (!file) return null;
  const url = file['@microsoft.graph.downloadUrl'];
  if (!url) throw new Error('OneDrive: חסר download URL');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`OneDrive download failed: ${r.status}`);
  const blob = await r.blob();
  const mime = file.file?.mimeType || blob.type || 'application/octet-stream';
  return { name: file.name, mime, blob };
}
