import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { isNonNullable } from '../../../../utils/rx-operators';
import {
  FriendInvitationDialogComponent,
  SubmittedFriendInvitation,
} from './friend-invitation-dialog/friend-invitation-dialog.component';

@Component({
  selector: 'app-contact-selection-dialog',
  templateUrl: './contact-selection-dialog.component.html',
  styleUrls: ['./contact-selection-dialog.component.scss'],
})
export class ContactSelectionDialogComponent {
  constructor(
    private readonly dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<ContactSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectedContact
  ) {}

  openFriendInvitationDialog() {
    const nestedDialogRef = this.dialog.open(FriendInvitationDialogComponent, {
      minWidth: '90%',
      data: { email: '' },
    });
    nestedDialogRef
      .afterClosed()
      .pipe(isNonNullable())
      .subscribe(result => this.dialogRef.close(result));
  }

  onCancelClicked() {
    this.dialogRef.close();
  }
}

export interface SelectedContact {
  email?: string;
}
