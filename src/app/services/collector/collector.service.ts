import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { MimeType } from 'src/app/utils/mime-type';
import { ProofRepository } from '../data/proof/proof-repository.service';
import { InformationProvider } from './information/information-provider';

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  private readonly informationProviders = new Set<InformationProvider>();

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }

  storeAndCollect$(rawBase64: string, mimeType: MimeType) {
    return this.proofRepository.saveRawFile$(rawBase64, mimeType).pipe(
      map(uri => fileNameWithoutExtension(uri)), // get the proof hash from the uri
      // TODO: store the media file
      switchMap(hash => this.proofRepository.add$({ hash, mimeType, timestamp: Date.now() })),
      // TODO: collect the info (e.g. GPS) with the background task
      switchMap(({ 0: added }) => forkJoin([...this.informationProviders].map(provider => provider.collectAndStore$(added))))
      // TODO: sign the proof with the background task
    );
  }

  addInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.add(provider));
  }

  removeInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.delete(provider));
  }
}
