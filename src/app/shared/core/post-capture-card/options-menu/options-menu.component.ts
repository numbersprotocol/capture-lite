import { Component, Inject } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { Proof } from '../../../../shared/services/repositories/proof/proof';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
})
export class OptionsMenuComponent {
  readonly options = Option;
  constructor(
    private readonly bottomSheetRef: MatBottomSheetRef<OptionsMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) readonly data: { proof: Proof }
  ) {}

  openLink(option: Option) {
    this.bottomSheetRef.dismiss(option);
  }
}

export enum Option {
  Share,
  Delete,
  ViewCertificate,
}
