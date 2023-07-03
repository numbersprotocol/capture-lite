/**
 * Calculates the estimated base64 size in bytes based on the original file size.
 * @param fileSizeInBytes The size of the file in bytes.
 * @returns The estimated base64 size in bytes.
 *
 * Base64 encoding increases the file size by approximately 33%. It converts
 * every 3 bytes of binary data into 4 bytes of ASCII characters. This overhead
 * is necessary to represent binary data in a text-based format. To estimate the
 * approximate size of the Base64 representation of a file, you can use the following formula:
 * Base64Size ≈ (OriginalFileSize * 4) / 3
 */
// eslint-disable-next-line class-methods-use-this
export function calculateBase64Size(fileSizeInBytes: number): number {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return Math.ceil((fileSizeInBytes * 4) / 3);
}
