import { Injectable } from '@angular/core';
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

    proof.willCollectTruth = true;
    await this.proofRepository.add(proof);

    const collected = await this.collectorService.run(await proof.getAssets());

    return this.proofRepository.update(
      collected,
      (x, y) => getOldProof(x).hash === getOldProof(y).hash
    );
  }
}
