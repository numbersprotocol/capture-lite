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

/**
 * Checks if there is enough available memory to perform data encoding.
 *
 * @param fileSizeInBytes The size of the file in bytes.
 * @param availableMemory The available memory in bytes.
 * @param buffer The buffer size to add as a safety margin (default: 20% of fileSizeInBytes).
 *               The buffer provides additional memory space to handle any unforeseen memory
 *               requirements or fluctuations during the encoding process. It acts as a safety
 *               margin to avoid potential out-of-memory errors. By default, the buffer size is
 *               set to 20% of the fileSizeInBytes. You can adjust the buffer size based on your
 *               specific memory needs. Setting a larger buffer size increases the chances of
 *               successful encoding by allocating more memory, but it also consumes more memory
 *               resources. Finding the right balance between buffer size and available memory
 *               is important for optimal performance and reliability.
 * @returns True if there is enough memory, false otherwise.
 */
export function hasEnoughMemoryForEncoding(
  fileSizeInBytes: number,
  availableMemory: number,
  buffer = 0.2
): boolean {
  const base64SizeInBytes = calculateBase64Size(fileSizeInBytes);
  const bufferSize = base64SizeInBytes * buffer;
  const requiredMemory = base64SizeInBytes + bufferSize;
  return requiredMemory <= availableMemory;
}
