import { Component, Inject } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { distinctUntilChanged } from 'rxjs/operators';
import { DiaBackendAssetRepository } from '../../../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { Proof } from '../../../../../shared/services/repositories/proof/proof';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';
@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
})
export class OptionsMenuComponent {
  readonly options = Option;
  readonly asset$ = this.diaBackendAssetRepository
    .fetchByProof$(this.data.proof)
    .pipe(isNonNullable(), distinctUntilChanged());

  constructor(
    private readonly bottomSheetRef: MatBottomSheetRef<OptionsMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) readonly data: { proof: Proof },
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  openLink(option: Option) {
    this.bottomSheetRef.dismiss(option);
  }
}

export enum Option {
  Share,
  Transfer,
  Delete,
  ViewCertificate,
}
