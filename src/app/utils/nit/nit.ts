import { ethers } from 'ethers';
/**
 * WORKAROUND: https://github.com/numbersprotocol/capture-lite/issues/3087
 * In our Capture Cam project, we use the @numbersprotocol/nit module,
 * which lacks published type definitions. This leads to a TypeScript error:
 * "Could not find a declaration file for module '@numbersprotocol/nit'".
 * As a temporary measure, we are applying the @ts-expect-error comment
 * to suppress this error.
 */
// @ts-expect-error  Type definitions for '@numbersprotocol/nit' are not available
import * as nit from '@numbersprotocol/nit';
import {
  SignedMessage,
  getSerializedSortedSignedMessage,
} from '../../shared/repositories/proof/proof';

export async function generateIntegritySha(message: SignedMessage) {
  const serializedSignedMessage = getSerializedSortedSignedMessage(message);
  const dataBytes = ethers.toUtf8Bytes(serializedSignedMessage);
  const integritySha = await nit.getIntegrityHash(dataBytes);
  return integritySha;
}
