import { Signature } from '../../repositories/proof/proof';

export interface SignatureProvider {
  readonly id: string;
  idFor(source: any): string;
  provide(serializedSortedSignedTargets: string): Promise<Signature>;
}
