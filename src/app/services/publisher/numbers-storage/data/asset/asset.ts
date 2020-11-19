import { Tuple } from 'src/app/services/database/table/table';
import { OldSignature } from 'src/app/services/repositories/signature/signature';
import { SortedProofInformation } from 'src/app/services/serialization/serialization.service';

export interface Asset extends Tuple {
  readonly id: string;
  readonly proof_hash: string;
  readonly owner: string;
  readonly asset_file: string;
  readonly asset_file_thumbnail: string;
  readonly information: SortedProofInformation;
  readonly signature: OldSignature[];
  readonly caption: string;
  readonly uploaded_at: string;
  readonly is_original_owner: boolean;
}
