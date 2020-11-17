import { MimeType } from '../../../utils/mime-type';
import { Tuple } from '../../database/table/table';

export interface ProofOld extends Tuple {
  readonly hash: string;
  readonly mimeType: MimeType;
  readonly timestamp: number;
}
