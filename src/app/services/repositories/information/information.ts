import { Tuple } from '../../database/table/table';

export const enum Importance {
  Low = 'low',
  High = 'high'
}

export const enum InformationType {
  Device = 'device',
  Location = 'location',
  Other = 'other'
}

export interface Information extends Tuple {
  readonly proofHash: string;
  readonly provider: string;
  readonly name: string;
  readonly value: string;
  readonly importance: Importance;
  readonly type: InformationType;
}
