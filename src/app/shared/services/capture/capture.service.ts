import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { CameraService, Photo } from '../camera/camera.service';
import { CollectorService } from '../collector/collector.service';
import { ImageStore } from '../image-store/image-store.service';
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
  readonly collectingOldProofHashes$ = this._collectingOldProofHashes$
    .asObservable()
    .pipe(distinctUntilChanged());

  constructor(
    private readonly cameraService: CameraService,
    private readonly proofRepository: ProofRepository,
    private readonly imageStore: ImageStore,
    private readonly collectorService: CollectorService
  ) {}

  async capture(restoredPhoto?: Photo) {
    const photo = restoredPhoto ?? (await this.cameraService.takePhoto());
    const proof = await Proof.from(
      this.imageStore,
      { [photo.base64]: { mimeType: photo.mimeType } },
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
      proof.timestamp
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
