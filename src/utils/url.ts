export function getFileType(url?: string): 'unknown' | 'video' | 'image' {
  if (url === undefined) {
    return 'unknown';
  }
  if (url.toLowerCase().includes('.mp4')) {
    return 'video';
  }
  if (
    url.toLowerCase().includes('.jpg') ||
    url.toLowerCase().includes('.jpeg')
  ) {
    return 'image';
  }
  return 'unknown';
}

/**
 * @param url - Exmaple urls from GoPro
 * * http://10.5.5.9:8080/videos/DCIM/100GOPRO/GH010168.MP4
 * * http://10.5.5.9:8080/gopro/media/thumbnail?path=100GOPRO/GH010168.MP4
 *
 * @returns fileName from url - For example: GH010168.MP4
 */
export function extractFileNameFromGoProUrl(url: string): string {
  return url.split('/').pop() ?? '';
}

export function urlIsImage(url: string): boolean {
  return (
    url.toLocaleLowerCase().includes('.jpeg') ||
    url.toLocaleLowerCase().includes('.jpg')
  );
}

export function urlIsVideo(url: string): boolean {
  return url.toLowerCase().includes('.mp4');
}

export function detectFileTypeFromUrl(
  url: string
): 'image' | 'video' | 'unknown' {
  if (urlIsImage(url)) {
    return 'image';
  }
  if (urlIsVideo(url)) {
    return 'video';
  }
  return 'unknown';
}
