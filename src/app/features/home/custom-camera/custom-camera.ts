import { SafeUrl } from '@angular/platform-browser';

/**
 * Maximum allowed upload size in MB.
 *
 * This value is set based on extensive testing of video file sizes on various devices.
 * During the testing phase, we recorded videos with sizes of 15 MB, 30 MB, 45 MB, 50 MB, 55 MB,
 * and 60 MB. Our findings showed that on Android devices, uploads were successful up to 50 MB,
 * while on iOS devices, uploads were successful up to 45 MB.
 *
 * It's important to note that the maximum allowed upload size may be subject to change as we
 * continue to explore better solutions and encounter devices with different capacity limitations.
 */
export const MAX_ALLOWED_UPLOAD_SIZE_IN_MB = 31;

export const MAX_ALLOWED_UPLOAD_SIZE_IN_BYTES =
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  MAX_ALLOWED_UPLOAD_SIZE_IN_MB * 1024 * 1024;

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

export function toCustomCameraMimeType(
  mimeType: string
): 'image/jpeg' | 'video/mp4' {
  if (mimeType.startsWith('image/')) {
    return 'image/jpeg';
  }
  if (mimeType.startsWith('video/')) {
    return 'video/mp4';
  }
  throw TypeError(`Unsupported mimeType: ${mimeType}`);
}
