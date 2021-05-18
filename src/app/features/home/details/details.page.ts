import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import SwiperCore, { Virtual } from 'swiper/core';
import { DiaBackendAsset } from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { Proof } from '../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';

SwiperCore.use([Virtual]);

@UntilDestroy()
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage {
  private readonly detailedCaptures$: Observable<
    DetailedCapture[]
  > = this.proofRepository.all$.pipe(
    map(proofs => proofs.map(p => new DetailedCapture(p)))
  );

  constructor(
    private readonly navController: NavController,
    private readonly proofRepository: ProofRepository
  ) {}

  navigateBack() {
    return this.navController.back();
  }
}

class DetailedCapture {
  readonly mediaUrl$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return this.proofOrDiaBackendAsset.getFirstAssetUrl();

    return this.proofOrDiaBackendAsset.asset_file;
  });

  readonly mediaMimeType$ = defer(async () => {
    if (this.proofOrDiaBackendAsset instanceof Proof)
      return (await this.proofOrDiaBackendAsset.getFirstAssetMeta()).mimeType;
    return this.proofOrDiaBackendAsset.asset_file_mime_type;
  });

  constructor(
    private readonly proofOrDiaBackendAsset: Proof | DiaBackendAsset
  ) {}
}
