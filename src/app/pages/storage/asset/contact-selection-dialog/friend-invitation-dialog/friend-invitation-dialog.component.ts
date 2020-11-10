import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-friend-invitation-dialog',
  templateUrl: './friend-invitation-dialog.component.html',
  styleUrls: ['./friend-invitation-dialog.component.scss'],
})
export class FriendInvitationDialogComponent {

  constructor(
    private readonly dialogRef: MatDialogRef<FriendInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubmittedFriendInvitation
  ) { }

  onCancelClicked() {
    this.dialogRef.close();
  }
}

export interface SubmittedFriendInvitation {
  email: string;
}
