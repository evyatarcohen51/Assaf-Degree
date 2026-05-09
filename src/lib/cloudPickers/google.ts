import { loadScript } from './loadScript';
import type { PickedCloudFile } from './types';

declare global {
  interface Window {
    gapi?: {
      load: (api: string, options: { callback: () => void }) => void;
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
      picker: {
        Action: { PICKED: string; CANCEL: string };
        DocsView: new () => GooglePickerView;
        PickerBuilder: new () => GooglePickerBuilder;
      };
    };
  }
}

interface GooglePickerView {
  setIncludeFolders: (v: boolean) => GooglePickerView;
  setSelectFolderEnabled: (v: boolean) => GooglePickerView;
  setOwnedByMe: (v: boolean) => GooglePickerView;
  setParent: (parentId: string) => GooglePickerView;
}

interface GooglePickerBuilder {
  addView: (v: GooglePickerView) => GooglePickerBuilder;
  setOAuthToken: (t: string) => GooglePickerBuilder;
  setDeveloperKey: (k: string) => GooglePickerBuilder;
  setAppId: (id: string) => GooglePickerBuilder;
  setCallback: (cb: (data: GooglePickerCallback) => void) => GooglePickerBuilder;
  build: () => { setVisible: (v: boolean) => void };
}

interface GooglePickerCallback {
  action: string;
  docs?: { id: string; name: string; mimeType: string }[];
}

const GIS_URL = 'https://accounts.google.com/gsi/client';
const GAPI_URL = 'https://apis.google.com/js/api.js';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const NATIVE_EXPORTS: Record<string, { mime: string; ext: string }> = {
  'application/vnd.google-apps.document': { mime: 'application/pdf', ext: '.pdf' },
  'application/vnd.google-apps.spreadsheet': { mime: 'application/pdf', ext: '.pdf' },
  'application/vnd.google-apps.presentation': { mime: 'application/pdf', ext: '.pdf' },
  'application/vnd.google-apps.drawing': { mime: 'application/pdf', ext: '.pdf' },
};

let pickerLoaded = false;

async function loadPicker(): Promise<void> {
  if (pickerLoaded) return;
  await new Promise<void>((resolve) => {
    window.gapi!.load('picker', { callback: () => resolve() });
  });
  pickerLoaded = true;
}

function requestAccessToken(clientId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else if (resp.access_token) resolve(resp.access_token);
        else reject(new Error('Google: no access token returned'));
      },
      error_callback: (err) => {
        if (err.type === 'popup_closed' || err.type === 'popup_failed_to_open') {
          resolve(null);
        } else {
          reject(new Error(`Google: ${err.type || err.message || 'OAuth error'}`));
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent select_account' });
  });
}

export async function pickFromGoogleDrive(): Promise<PickedCloudFile | null> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!clientId || !apiKey) {
    throw new Error('Google Drive: חסר VITE_GOOGLE_CLIENT_ID או VITE_GOOGLE_API_KEY');
  }

  await Promise.all([loadScript(GIS_URL), loadScript(GAPI_URL)]);
  await loadPicker();

  const token = await requestAccessToken(clientId);
  if (!token) return null;

  const picked = await new Promise<{ id: string; name: string; mimeType: string } | null>(
    (resolve) => {
      const view = new window.google!.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setOwnedByMe(true)
        .setParent('root');
      const appId = clientId.split('-')[0];
      const picker = new window.google!.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .setAppId(appId)
        .setCallback((data) => {
          if (data.action === window.google!.picker.Action.PICKED && data.docs?.[0]) {
            const d = data.docs[0];
            resolve({ id: d.id, name: d.name, mimeType: d.mimeType });
          } else if (data.action === window.google!.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();
      picker.setVisible(true);
    },
  );

  if (!picked) return null;

  const native = NATIVE_EXPORTS[picked.mimeType];
  let url: string;
  let mime: string;
  let name = picked.name;
  if (native) {
    url = `https://www.googleapis.com/drive/v3/files/${picked.id}/export?mimeType=${encodeURIComponent(native.mime)}`;
    mime = native.mime;
    if (!name.toLowerCase().endsWith(native.ext)) name += native.ext;
  } else {
    url = `https://www.googleapis.com/drive/v3/files/${picked.id}?alt=media`;
    mime = picked.mimeType;
  }

  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`Google Drive download failed: ${r.status}`);
  const blob = await r.blob();
  return { name, mime, blob };
}
