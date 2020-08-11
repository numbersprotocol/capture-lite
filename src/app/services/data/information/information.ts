export interface Information {
  readonly proofHash: string;
  readonly provider: string;
  readonly name: string;
  readonly value: string;
  readonly important: boolean;
  readonly type: number;
}
