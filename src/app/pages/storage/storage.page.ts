import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, of, zip } from 'rxjs';
import { concatMap, map, mapTo, switchMap } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { fromExtension } from 'src/app/utils/mime-type';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-storage',
  templateUrl: 'storage.page.html',
  styleUrls: ['storage.page.scss'],
})
export class StoragePage implements OnInit {

  readonly proofListWithRaw$ = this.proofRepository.getAll$().pipe(
    map(proofSet => [...proofSet]),
    concatMap(proofArray => zip(
      of(proofArray),
      forkJoin(proofArray.map(proof => this.proofRepository.getRawFile$(proof)))
    )),
    map(([proofs, base64Strings]) => proofs.map((proof, index) => ({
      proof,
      rawBase64: base64Strings[index]
    })))
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService,
    private readonly collectorService: CollectorService
  ) { }

  ngOnInit() {
    this.proofRepository.refresh$().pipe(
      untilDestroyed(this)
    ).subscribe();
  }

  refresh(event: any) {
    this.proofRepository.refresh$().pipe(
      mapTo(event.target.complete()),
      untilDestroyed(this)
    ).subscribe();
  }

  capture() {
    this.cameraService.capture$().pipe(
      switchMap(cameraPhoto => this.collectorService.storeAndCollect$(
        cameraPhoto.base64String,
        fromExtension(cameraPhoto.format)
      )),
      untilDestroyed(this)
    ).subscribe();
  }
}
