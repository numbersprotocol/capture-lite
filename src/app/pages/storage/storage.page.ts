import { Component, ViewChildren } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
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
      rawBase64: base64Strings[index]
    })))
  );

  index: number = 0;
  @ViewChildren('slides') slides: IonSlides | undefined;
  buttonName = "Next";
  selectedSlide: any;

  slideOpts = {
    // slidesPerView: 1,

    loop: false,
    autoplay: false
  };
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

  ngOnInit() {
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
