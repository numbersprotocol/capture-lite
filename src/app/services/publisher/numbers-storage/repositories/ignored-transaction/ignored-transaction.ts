import { Tuple } from '../../../../../services/database/table/table';

export interface IgnoredTransaction extends Tuple {
  readonly id: string;
}
