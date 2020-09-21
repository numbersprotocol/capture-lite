import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
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


  readonly today$ = new Observable(observer => {
    (async () => {
      observer.next('');
      await new Promise(resolve => setTimeout(resolve, 1000));
    })();
  });

  readonly proofsWithRawByDate$ = this.proofs$.pipe(
    map(proofs => proofs.map(proof => this.proofRepository.getThumbnail$(proof))),
    concatMap(rawBase64$ => zip(this.proofs$, combineLatest(rawBase64$))),
    map(([proofs, rawBase64s]) =>
      proofs
        .map((proof, index) => ({
          proof,
          rawBase64: rawBase64s[index]
        }))
        .sort(
          (proofWithRawBase64A, proofWithRawBase64B) =>
            proofWithRawBase64B.proof.timestamp - proofWithRawBase64A.proof.timestamp
        )
    ),
    mergeMap(proofsWithRawBase64 => this.today$.pipe(
      map(date =>
        proofsWithRawBase64
          .filter(
            proofWithRawBase64 =>
              date === '' ||
              new Date(proofWithRawBase64.proof.timestamp)
                .toISOString()
                .substr(0, 'yyyy-mm-dd'.length) === date
          )
          .reduce((groupedProofsWithRawBase64, proofWithRawBase64) => {
            const index = groupedProofsWithRawBase64.findIndex(
              processingproofsWithRawBase64 =>
                new Date(processingproofsWithRawBase64[0].proof.timestamp)
                  .toISOString()
                  .substr(0, 'yyyy-mm-dd'.length) ===
                new Date(proofWithRawBase64.proof.timestamp)
                  .toISOString()
                  .substr(0, 'yyyy-mm-dd'.length)
            );
            if (index === -1) {
              groupedProofsWithRawBase64.push([proofWithRawBase64]);
            }
            else {
              groupedProofsWithRawBase64[index].push(proofWithRawBase64);
            }

            return groupedProofsWithRawBase64;
          }, [] as { proof: Proof, rawBase64: string; }[][])
      )
    )),
    // tap(console.log)
  );



  readonly proofsWithRaw$ = this.proofs$.pipe(
    concatMap(proofs => forkJoinWithDefault(proofs.map(proof => this.proofRepository.getThumbnail$(proof)))),
    concatMap(base64Strings => zip(this.proofs$, of(base64Strings))),
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

  getDays(date: any) {
    return new Date(date).toString().substr(4, 12);
    // return new Date(date)
    //   .toISOString()
    //   .substr(0, 'yyyy-mm-dd'.length);
  }

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
