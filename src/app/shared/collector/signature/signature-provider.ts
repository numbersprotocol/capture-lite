import { Signature } from '../../repositories/proof/proof';

export interface SignatureProvider {
  readonly id: string;
  provide(serializedSortedSignedTargets: string): Promise<Signature>;
}
