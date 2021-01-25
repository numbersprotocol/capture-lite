import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-migrating-dialog',
  templateUrl: './migrating-dialog.component.html',
  styleUrls: ['./migrating-dialog.component.scss'],
})
export class MigratingDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}
