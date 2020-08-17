export const enum Importance {
  Low = 'low',
  High = 'high'
}

export const enum InformationType {
  Device = 'device',
  Location = 'location',
  Other = 'other'
}

export interface Information {
  readonly proofHash: string;
  readonly provider: string;
  readonly name: string;
  readonly value: string;
  readonly importance: Importance;
  readonly type: InformationType;
}
