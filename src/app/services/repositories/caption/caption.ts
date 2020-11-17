import { Tuple } from '../../database/table/table';

export interface Caption extends Tuple {
  readonly proofHash: string;
  readonly text: string;
}
