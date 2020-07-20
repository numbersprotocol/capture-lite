import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import { concatMap, map, switchMap, tap } from 'rxjs/operators';
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
export class StoragePage {

  readonly proofThumbs$ = this.proofRepository.getAll$().pipe(
    map(proofSet => [...proofSet]),
    map(proofArray => proofArray.map(proof => this.proofRepository.getRawFile$(proof))),
    concatMap(rawFileObservables => forkJoin(rawFileObservables))
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService,
    private readonly collectorService: CollectorService
  ) { }

  capture() {
    this.cameraService.capture$().pipe(
      switchMap(cameraPhoto => this.collectorService.storeAndCollect$(
        cameraPhoto.base64String,
        fromExtension(cameraPhoto.format)
      )),
      tap(v => console.log(v)),
      untilDestroyed(this)
    ).subscribe();
  }
}
