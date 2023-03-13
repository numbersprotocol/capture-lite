import { Injectable } from '@angular/core';
import { CameraSource } from '@capacitor/camera';
import { BehaviorSubject } from 'rxjs';
import { MimeType } from '../../utils/mime-type';
import { CollectorService } from '../collector/collector.service';
import { MediaStore } from '../media/media-store/media-store.service';
import { getOldProof } from '../repositories/proof/old-proof-adapter';
import { Proof } from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

@Injectable({
  providedIn: 'root',
})
export class CaptureService {
  private readonly _collectingOldProofHashes$ = new BehaviorSubject<
    Set<string>
  >(new Set());
  readonly collectingOldProofHashes$ = this._collectingOldProofHashes$;

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly mediaStore: MediaStore,
    private readonly collectorService: CollectorService
  ) {}

  async capture(media: Media) {
    const proof = await Proof.from(
      this.mediaStore,
      { [media.base64]: { mimeType: media.mimeType } },
      { timestamp: Date.now(), providers: {} },
      {}
    );
    await this.proofRepository.add(proof);

    this._collectingOldProofHashes$.next(
      // eslint-disable-next-line rxjs/no-subject-value
      this._collectingOldProofHashes$.value.add(getOldProof(proof).hash)
    );
    const collected = await this.collectorService.run(
      await proof.getAssets(),
      proof.timestamp,
      media.source
    );
    // eslint-disable-next-line rxjs/no-subject-value
    const newCollectingOldProofHashes = this._collectingOldProofHashes$.value;
    newCollectingOldProofHashes.delete(getOldProof(proof).hash);
    this._collectingOldProofHashes$.next(newCollectingOldProofHashes);

    return this.proofRepository.update(
      [collected],
      (x, y) => getOldProof(x).hash === getOldProof(y).hash
    );
  }
}

export interface Media {
  readonly mimeType: MimeType;
  readonly base64: string;
  readonly source: CameraSource;
}
