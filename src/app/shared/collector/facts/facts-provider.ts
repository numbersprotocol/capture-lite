import { Assets, Facts } from '../../repositories/proof/proof';

export interface FactsProvider {
  readonly id: string;
  provide(assets: Assets, capturedTimestamp?: number): Promise<Facts>;
}
