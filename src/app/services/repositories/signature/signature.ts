import { Tuple } from '../../database/table/table';

export interface OldSignature extends Tuple {
  readonly proofHash: string;
  readonly provider: string;
  readonly signature: string;
  readonly publicKey: string;
}
