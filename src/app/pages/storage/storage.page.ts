import { Component, ViewChildren } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { formatDate } from '@angular/common';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
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


  readonly proofsWithRaw$ = this.proofs$.pipe(
    concatMap(proofs => forkJoinWithDefault(proofs.map(proof => this.proofRepository.getThumbnail$(proof)))),
    concatMap(base64Strings => zip(this.proofs$, of(base64Strings))),
    map(([proofs, base64Strings]) => proofs.map((proof, index) => ({
      proof,
      rawBase64: base64Strings[index],
      date: this.getDate(proof.timestamp)
    })))
  );

  index = 0;
  @ViewChildren('slides') slides: IonSlides | undefined;
  buttonName = 'Next';
  selectedSlide: any;

  slideOpts = {
    // slidesPerView: 1,

    loop: false,
    autoplay: false
  };


  readonly proofsWithRawByDate$ = this.proofsWithRaw$.pipe(
    map(proofsWithRaw => proofsWithRaw.sort((proofWithRawBase64A, proofWithRawBase64B) =>
      proofWithRawBase64B.proof.timestamp - proofWithRawBase64A.proof.timestamp)),
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


  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService,
    private readonly collectorService: CollectorService
  ) { }

  getDate(timestamp: number) {
    return formatDate(timestamp, 'mediumDate', 'en-US');

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


  ionSlideLoad(slide: any) {
    this.selectedSlide = slide;
  }

  ionSlideChange(slide: any) {
    this.selectedSlide = slide;
  }

  next() {
    this.selectedSlide.slideNext();
  }
  back() {
    this.selectedSlide.slidePrev();
  }
}
