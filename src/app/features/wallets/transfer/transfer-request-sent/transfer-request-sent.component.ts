import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-transfer-request-sent',
  templateUrl: './transfer-request-sent.component.html',
  styleUrls: ['./transfer-request-sent.component.scss'],
})
export class TransferRequestSentComponent {
  mode: 'deposit' | 'withdraw';
  dark = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: 'deposit' | 'withdraw',
    private readonly dialogRef: MatDialogRef<TransferRequestSentComponent>,
    readonly translocoService: TranslocoService
  ) {
    this.mode = data;
    this.dark =
      window.navigator.userAgent.includes('AndroidDarkMode') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  onDone() {
    this.dialogRef.close();
  }
}
