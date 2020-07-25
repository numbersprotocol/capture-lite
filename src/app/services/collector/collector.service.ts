import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { forkJoin, of, zip } from 'rxjs';
import { defaultIfEmpty, map, switchMap } from 'rxjs/operators';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { MimeType } from 'src/app/utils/mime-type';
import { ProofRepository } from '../data/proof/proof-repository.service';
import { InformationProvider } from './information/information-provider';
import { SignatureProvider } from './signature/signature-provider';

const { BackgroundTask } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  private readonly informationProviders = new Set<InformationProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }

  storeAndCollect(rawBase64: string, mimeType: MimeType) {
    subscribeInBackground(this._storeAndCollect$(rawBase64, mimeType));
  }

  private _storeAndCollect$(rawBase64: string, mimeType: MimeType) {
    return this.proofRepository.saveRawFile$(rawBase64, mimeType).pipe(
      // Get the proof hash from the uri.
      map(uri => fileNameWithoutExtension(uri)),
      // Store the media file.
      switchMap(hash => this.proofRepository.add$({ hash, mimeType, timestamp: Date.now() })),
      // Collect the info (e.g. GPS).
      switchMap(({ 0: proof }) => zip(
        of(proof),
        forkJoin([...this.informationProviders].map(provider => provider.collectAndStore$(proof)))).pipe(defaultIfEmpty([]))
      ),
      // Sign the proof and related information.
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
