import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-transfer-loading',
  templateUrl: './transfer-loading.component.html',
  styleUrls: ['./transfer-loading.component.scss'],
})
export class TransferLoadingComponent {
  mode: 'deposit' | 'withdraw';
  dark = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: 'deposit' | 'withdraw') {
    this.mode = data;
    this.dark =
      window.navigator.userAgent.includes('AndroidDarkMode') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
