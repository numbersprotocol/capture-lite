import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { MimeType } from 'src/app/utils/mime-type';
import { ProofRepository } from '../data/proof/proof-repository.service';

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }

  storeAndCollect$(rawBase64: string, mimeType: MimeType) {
    return this.proofRepository.addRawFile$(rawBase64, mimeType).pipe(
      map(uri => fileNameWithoutExtension(uri)), // get the proof hash from the uri
      // TODO: store the media file
      switchMap(hash => this.proofRepository.add$({ hash, mimeType, timestamp: Date.now() }))
      // TODO: collect the info (e.g. GPS) with the background task
      // TODO: sign the proof with the background task
    );
  }
}
