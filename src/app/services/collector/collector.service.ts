import { Injectable } from '@angular/core';
import { forkJoin, of, zip } from 'rxjs';
import { defaultIfEmpty, map, switchMap } from 'rxjs/operators';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { MimeType } from 'src/app/utils/mime-type';
import { ProofRepository } from '../data/proof/proof-repository.service';
import { InformationProvider } from './information/information-provider';
import { SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  private readonly informationProviders = new Set<InformationProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }

  storeAndCollect$(rawBase64: string, mimeType: MimeType) {
    return this.proofRepository.saveRawFile$(rawBase64, mimeType).pipe(
      map(uri => fileNameWithoutExtension(uri)), // get the proof hash from the uri
      // TODO: store the media file
      switchMap(hash => this.proofRepository.add$({ hash, mimeType, timestamp: Date.now() })),
      // TODO: collect the info (e.g. GPS) with the background task
      switchMap(({ 0: proof }) => zip(
        of(proof),
        forkJoin([...this.informationProviders].map(provider => provider.collectAndStore$(proof)))).pipe(defaultIfEmpty([]))
      ),
      // TODO: sign the proof with the background task
      switchMap(([proof]) => forkJoin([...this.signatureProviders].map(provider => provider.collectAndStore$(proof))))
    );
  }

  addInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.add(provider));
  }

  removeInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.delete(provider));
  }

  addSignatureProvider(...providers: SignatureProvider[]) {
    providers.forEach(provider => this.signatureProviders.add(provider));
  }

  removeSignatureProvider(...providers: SignatureProvider[]) {
    providers.forEach(provider => this.signatureProviders.delete(provider));
  }
}
