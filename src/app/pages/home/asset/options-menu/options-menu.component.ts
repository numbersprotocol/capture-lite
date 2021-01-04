import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
})
export class OptionsMenuComponent {
  readonly options = Option;
  constructor(
    private readonly router: Router,
    private readonly bottomSheetRef: MatBottomSheetRef<OptionsMenuComponent>
  ) {}

  openLink(option: Option) {
    this.bottomSheetRef.dismiss(option);
  }
}

export enum Option {
  Delete,
  Share,
}
