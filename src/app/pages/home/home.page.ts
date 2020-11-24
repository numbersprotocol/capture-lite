import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, of, zip } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { CameraService } from 'src/app/services/camera/camera.service';
import { CollectorService } from 'src/app/services/collector/collector.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/repositories/asset/asset-repository.service';
import { PublishersAlert } from 'src/app/services/publisher/publishers-alert/publishers-alert.service';
import { getOldProof } from 'src/app/services/repositories/proof/old-proof-adapter';
import { ProofRepository } from 'src/app/services/repositories/proof/proof-repository.service';
import { fromExtension } from 'src/app/utils/mime-type';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  readonly captures$ = this.getCaptures$();
  postCaptures$ = this.getPostCaptures$();
  readonly username$ = this.numbersStorageApi.getUsername$();
  captureButtonShow = true;

  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService,
    private readonly collectorService: CollectorService,
    private readonly publishersAlert: PublishersAlert,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  private getCaptures$() {
    const originallyOwnedAssets$ = this.assetRepository.getAll$().pipe(
      map(assets => assets.filter(asset => asset.is_original_owner))
    );

    const proofsWithThumbnailAndOld$ = this.proofRepository.getAll$().pipe(
      concatMap(proofs => Promise.all(proofs.map(async (proof) =>
        ({ proof, thumbnailDataUrl: await proof.getThumbnailDataUrl(), oldProof: await getOldProof(proof) })
      )))
    );

    return combineLatest([originallyOwnedAssets$, proofsWithThumbnailAndOld$]).pipe(
      map(([assets, proofsWithThumbnailAndOld]) => assets.map(asset => ({
        asset,
        proofWithThumbnailAndOld: proofsWithThumbnailAndOld.find(p => p.oldProof.hash === asset.proof_hash)
      })))
    );
  }

  private getPostCaptures$() {
    return zip(this.numbersStorageApi.listTransactions$(), this.numbersStorageApi.getEmail$()).pipe(
      map(([transactionListResponse, email]) => transactionListResponse.results.filter(
        transaction => transaction.sender !== email && !transaction.expired && transaction.fulfilled_at
      )),
      concatMap(transactions => zip(
        of(transactions),
        forkJoinWithDefault(transactions.map(transaction => this.numbersStorageApi.readAsset$(transaction.asset.id)))
      )),
      map(([transactions, assets]) => transactions.map((transaction, index) => ({
        transaction,
        asset: assets[index]
      })))
    );
  }

  capture() {
    this.cameraService.capture$().pipe(
      concatMap(cameraPhoto => this.collectorService.runAndStore({
        [cameraPhoto.base64String]: { mimeType: fromExtension(cameraPhoto.format) }
      })),
      concatMap(proof => this.publishersAlert.presentOrPublish(proof)),
      untilDestroyed(this)
    ).subscribe();
  }

  onTapChanged(event: MatTabChangeEvent) {
    this.captureButtonShow = event.index === 0;
    if (event.index === 1) { this.postCaptures$ = this.getPostCaptures$(); }
  }
}
