import { Component, ViewChildren } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { concatMap, map, mergeMap, tap } from 'rxjs/operators';
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

  // readonly proofsWithRawByDate$ = this.proofs$.pipe(
  //   concatMap(proofs => forkJoinWithDefault(proofs.map(proof => this.proofRepository.getThumbnail$(proof)))),
  //   concatMap(base64Strings => zip(this.proofs$, of(base64Strings))),
  //   map(([proofs, base64Strings]) => proofs.map((proof, index) => ({
  //     proof,
  //     rawBase64: base64Strings[index]
  //   }))),
  //   map((proofsWithRawBase64) => proofsWithRawBase64.sort(
  //     (proofWithRawBase64A, proofWithRawBase64B) =>
  //       proofWithRawBase64B.proof.timestamp - proofWithRawBase64A.proof.timestamp
  //   ))
  // );
  readonly today$ = new Observable(observer => {
    (async () => {
      observer.next('');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // observer.next('2020-09-18');
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // observer.next('2020-09-20');
      // await new Promise(resolve => setTimeout(resolve, 1000));
    })();
  });
  // proofsWithRaw$>>>proofsWithRawByDate$>>{data,img} 
  // 建議的實現：
  // 該功能應僅在存儲頁面中實現。首先，創建日期應從每個證明的時間戳中得出。creation_date在返回的對象（將由發出的對象）中添加一個屬性，proofWithRaw$並用轉換為的值填充該屬性timestamp。
  // 聲明另一個只讀observable proofsWithRawByDate$，proofsWithRaw$用作源observable，使用pipable運算符將發出的源observable類型（對像數組）轉換為嵌套的對像數組，其中外部數組代表每個唯一的日期，內部數組代表所有的證明/ b64strings在給定的日期內。
  // 修改模板以使用proofsWithRawByDate$而不是proofsWithRaw$，展開嵌套數組以按日期對照片進行分類。
  // 調整樣式以符合UI設計


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
              proofsWithRawBase64 =>
                new Date(proofsWithRawBase64[0].proof.timestamp)
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
    tap(console.log)
  );



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
