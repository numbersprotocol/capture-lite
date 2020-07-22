import { Information } from 'src/app/services/data/information/information';
import { Proof } from 'src/app/services/data/proof/proof';

export function createSortedProofInformation(
  proof: Proof,
  informationList: Information[]
): SortedProofInformation {
  const sortedInformation = informationList.sort((a: Information, b: Information) => {
    const proofHashCompared = a.proofHash.localeCompare(b.proofHash);
    const providerCompared = a.provider.localeCompare(b.provider);
    const nameCompared = a.name.localeCompare(b.name);
    const valueCompared = a.value.localeCompare(b.value);
    if (proofHashCompared !== 0) { return proofHashCompared; }
    else if (providerCompared !== 0) { return providerCompared; }
    else if (nameCompared !== 0) { return nameCompared; }
    else { return valueCompared; }
  });
  return ({ proof, sortedInformation });
}

interface SortedProofInformation {
  readonly proof: Proof;
  readonly sortedInformation: Information[];
}
