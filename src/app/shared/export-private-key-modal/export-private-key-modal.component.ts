import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';

const { Clipboard } = Plugins;

@Component({
  selector: 'app-export-private-key-modal',
  templateUrl: './export-private-key-modal.component.html',
  styleUrls: ['./export-private-key-modal.component.scss'],
})
export class ExportPrivateKeyModalComponent {
  readonly privateKey: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ExportPrivateKeyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatDialogData,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar
  ) {
    this.privateKey = data.privateKey;
  }

  async copyToClipboard(privateKey: string) {
    await Clipboard.write({ string: privateKey });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
    this.dialogRef.close();
  }
}

interface MatDialogData {
  privateKey: string;
}
