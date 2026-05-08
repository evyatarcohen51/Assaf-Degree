import type { CloudProvider, PickedCloudFile } from './types';
import { pickFromGoogleDrive } from './google';
import { pickFromDropbox } from './dropbox';
import { pickFromOneDrive } from './onedrive';

export type { CloudProvider, PickedCloudFile };

export interface ProviderInfo {
  id: CloudProvider;
  label: string;
  enabled: boolean;
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'google',
    label: 'Google Drive',
    enabled: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_API_KEY),
  },
  {
    id: 'dropbox',
    label: 'Dropbox',
    enabled: Boolean(import.meta.env.VITE_DROPBOX_APP_KEY),
  },
  {
    id: 'onedrive',
    label: 'OneDrive',
    enabled: Boolean(import.meta.env.VITE_ONEDRIVE_CLIENT_ID),
  },
];

export function pickFromProvider(provider: CloudProvider): Promise<PickedCloudFile | null> {
  switch (provider) {
    case 'google':
      return pickFromGoogleDrive();
    case 'dropbox':
      return pickFromDropbox();
    case 'onedrive':
      return pickFromOneDrive();
  }
}
