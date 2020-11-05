import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
import { Proof } from 'src/app/services/data/proof/proof';
import {
  ProofRepository
} from 'src/app/services/data/proof/proof-repository.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { fromExtension } from 'src/app/utils/mime-type';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';



@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-storage',
  templateUrl: 'storage.page.html',
  styleUrls: ['storage.page.scss'],
})
export class StoragePage {

  private readonly proofs$ = this.proofRepository.getAll$();

  // TODO: rename for better readability.
  readonly proofsWithRaw$ = this.proofs$.pipe(
    concatMap(proofs => forkJoinWithDefault(proofs.map(proof => this.proofRepository.getThumbnail$(proof)))),
    concatMap(base64Strings => zip(this.proofs$, of(base64Strings))),
    map(([proofs, base64Strings]) => proofs.map((proof, index) => ({
      proof,
      rawBase64: base64Strings[index],
      date: formatDate(proof.timestamp, 'mediumDate', 'en-US')
    }))),
    map(proofsWithRaw => proofsWithRaw.sort((proofWithRawBase64A, proofWithRawBase64B) =>
      proofWithRawBase64B.proof.timestamp - proofWithRawBase64A.proof.timestamp)),
  );

  // TODO: rename for better readability.
  readonly proofsWithRawByDate$ = this.proofsWithRaw$.pipe(
    map(proofsWithRawBase64 =>
      proofsWithRawBase64
        .reduce((groupedProofsWithRawBase64, proofWithRawBase64) => {
          const index = groupedProofsWithRawBase64.findIndex(
            processingproofsWithRawBase64 =>
              processingproofsWithRawBase64[0].date
              === proofWithRawBase64.date
          );
          if (index === -1) {
            groupedProofsWithRawBase64.push([proofWithRawBase64]);
          }
          else {
            groupedProofsWithRawBase64[index].push(proofWithRawBase64);
          }
          return groupedProofsWithRawBase64;
        }, [] as { proof: Proof, rawBase64: string, date: string; }[][])
    )
  );

  readonly userName$ = this.numbersStorageApi.getUserName$();

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService,
    private readonly collectorService: CollectorService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  capture() {
    this.cameraService.capture$().pipe(
      map(cameraPhoto => this.collectorService.storeAndCollect(
        cameraPhoto.base64String,
        fromExtension(cameraPhoto.format)
      )),
      untilDestroyed(this)
    ).subscribe();
  }
}
