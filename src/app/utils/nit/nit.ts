import { ethers, sha256 } from 'ethers';
import {
  SignedMessage,
  getSerializedSortedSignedMessage,
} from '../../shared/repositories/proof/proof';

export async function generateIntegritySha(message: SignedMessage) {
  const serializedSignedMessage = getSerializedSortedSignedMessage(message);

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const data = JSON.stringify(JSON.stringify(serializedSignedMessage, null, 2));
  const dataBytes = ethers.toUtf8Bytes(data);

  /**
   * WORKAROUND: <TODO-paste-related-url-link>
   * Ideally we should use nit module to get integritySha as show below
   * ```
   * import * as nit from "@numbersprotocol/nit";
   * const dataBytes = ethers.toUtf8Bytes(data);
   * const integritySha = await nit.getIntegrityHash(dataBytes);
   * ```
   * However installing "@numbersprotocol/nit" causing ionic build errors.
   * Once "@numbersprotocol/nit" become browser friendly we can
   * remove this workaround and completely rely on "@numbersprotocol/nit"
   */
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const integritySha = sha256(dataBytes).substring(2);

  return integritySha;
}
