export interface GoProFile {
  name?: string;
  url: string;
  thumbnailUrl?: string;
  type?: 'image' | 'video' | 'unknown';
  size?: number;
  storageKey?: string; // TODO: remove this field
}

export interface GoProFileOnDevice {
  name: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'video' | 'unknown';
  size: number;
}
