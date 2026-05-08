export interface PickedCloudFile {
  name: string;
  mime: string;
  blob: Blob;
}

export type CloudProvider = 'google' | 'dropbox' | 'onedrive';
