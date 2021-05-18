import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AndroidBackButtonService } from '../../android-back-button/android-back-button.service';

@UntilDestroy()
@Component({
  selector: 'app-friend-invitation-dialog',
  templateUrl: './friend-invitation-dialog.component.html',
  styleUrls: ['./friend-invitation-dialog.component.scss'],
})
export class FriendInvitationDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<FriendInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubmittedFriendInvitation,
    private readonly androidBackButtonService: AndroidBackButtonService
  ) {
    this.androidBackButtonService
      .closeMatDialog$(dialogRef)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  onCancelClicked() {
    this.dialogRef.close();
  }
}

export interface SubmittedFriendInvitation {
  email: string;
}
