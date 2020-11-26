import { Tuple } from 'src/app/services/database/table/table';

export interface IgnoredTransaction extends Tuple {
  readonly id: string;
}
