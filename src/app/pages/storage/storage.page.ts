import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of, zip } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { Asset } from 'src/app/services/publisher/numbers-storage/data/asset/asset';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { fromExtension } from 'src/app/utils/mime-type';
import { forkJoinWithDefault, isNonNullable } from 'src/app/utils/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-storage',
  templateUrl: 'storage.page.html',
  styleUrls: ['storage.page.scss'],
})
export class StoragePage {

  private readonly assets$ = this.assetRepository.getAll$();
  private readonly captures$ = this.assets$.pipe(
    map(assets => assets.filter(asset => asset.is_original_owner))
  );
  private readonly postCaptures$ = this.assets$.pipe(
    map(assets => assets.filter(asset => !asset.is_original_owner))
  );
  readonly capturesWithRawByDate$ = this.captures$.pipe(this.appendAssetsRawAndGroupedByDate$());
  readonly postCapturesWithRawByDate$ = this.postCaptures$.pipe(this.appendAssetsRawAndGroupedByDate$());

  readonly userName$ = this.numbersStorageApi.getUserName$();
  captureButtonShow = true;

  constructor(
    private readonly assetRepository: AssetRepository,
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

  private appendAssetsRawAndGroupedByDate$() {
    return (assets$: Observable<Asset[]>) => assets$.pipe(
      concatMap(assets => forkJoinWithDefault(assets.map(asset => this.proofRepository.getByHash$(asset.proof_hash).pipe(
        isNonNullable(),
        first()
      )))),
      // tslint:disable-next-line: no-non-null-assertion
      concatMap(proofs => forkJoinWithDefault(proofs.map(proof => this.proofRepository.getThumbnail$(proof)))),
      concatMap(base64Strings => zip(assets$, of(base64Strings))),
      map(([assets, base64Strings]) => assets.map((asset, index) => ({
        asset,
        rawBase64: base64Strings[index],
        date: formatDate(asset.uploaded_at, 'mediumDate', 'en-US')
      }))),
      map(assetsWithRawAndDate => assetsWithRawAndDate.sort(
        (a, b) => Date.parse(b.asset.uploaded_at) - Date.parse(a.asset.uploaded_at)
      )),
      map(assetsWithRawBase64 => assetsWithRawBase64.reduce((groupedAssetsWithRawBase64, assetWithRawBase64) => {
        const index = groupedAssetsWithRawBase64.findIndex(
          processingAssetsWithRawBase64 =>
            processingAssetsWithRawBase64[0].date
            === assetWithRawBase64.date
        );
        if (index === -1) {
          groupedAssetsWithRawBase64.push([assetWithRawBase64]);
        }
        else {
          groupedAssetsWithRawBase64[index].push(assetWithRawBase64);
        }
        return groupedAssetsWithRawBase64;
      }, [] as { asset: Asset, rawBase64: string, date: string; }[][])
      )
    );
  }

  onTapChanged(event: MatTabChangeEvent) {
    this.captureButtonShow = event.index === 0;
  }
}
