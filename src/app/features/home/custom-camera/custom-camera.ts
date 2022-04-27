import { SafeUrl } from '@angular/platform-browser';

export const MAX_RECORD_TIME_IN_MILLISECONDS = 15000;

export type CustomCameraMediaType = 'image' | 'video';

export type CustomCameraMimeType = 'image/jpeg' | 'video/mp4';

export interface CustomCameraMediaItem {
  filePath: string;
  src: string;
  safeUrl: SafeUrl;
  type: CustomCameraMediaType;
  mimeType: CustomCameraMimeType;
}
