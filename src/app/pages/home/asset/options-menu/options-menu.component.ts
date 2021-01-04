import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
})
export class OptionsMenuComponent implements OnInit {
  readonly options = Option;
  isHome = false;
  constructor(
    private readonly router: Router,
    private readonly bottomSheetRef: MatBottomSheetRef<OptionsMenuComponent>
  ) {}

  ngOnInit() {
    this.isHome = this.router.url == '/home' ? true : false;
  }

  openLink(option: Option) {
    this.bottomSheetRef.dismiss(option);
  }
}

export enum Option {
  Delete,
  Share,
}
