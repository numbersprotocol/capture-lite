import { Tuple } from '../../../../../services/database/table/table';
import {
  OldSignature,
  SortedProofInformation,
} from '../../../../../services/repositories/proof/old-proof-adapter';

export interface Asset extends Tuple {
  readonly id: string;
  readonly proof_hash: string;
  readonly owner: string;
  readonly asset_file: string;
  readonly information: SortedProofInformation;
  readonly signature: OldSignature[];
  readonly caption: string;
  readonly uploaded_at: string;
  readonly is_original_owner: boolean;
}
