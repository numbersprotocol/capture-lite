import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, pluck } from 'rxjs/operators';
import { AndroidBackButtonService } from '../../../../../shared/android-back-button/android-back-button.service';
import { DiaBackendContactRepository } from '../../../../../shared/dia-backend/contact/dia-backend-contact-repository.service';
import { ErrorService } from '../../../../../shared/error/error.service';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';
import { FriendInvitationDialogComponent } from './friend-invitation-dialog/friend-invitation-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-contact-selection-dialog',
  templateUrl: './contact-selection-dialog.component.html',
  styleUrls: ['./contact-selection-dialog.component.scss'],
})
export class ContactSelectionDialogComponent {
  readonly contacts$ = this.diaBackendContactRepository.all$.pipe(
    pluck('results'),
    catchError((err: unknown) => this.errorService.toastError$(err))
  );
  readonly isFetching$ = this.diaBackendContactRepository.isFetching$;

  constructor(
    private readonly dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<ContactSelectionDialogComponent>,
    private readonly diaBackendContactRepository: DiaBackendContactRepository,
    private readonly errorService: ErrorService,
    private readonly androidBackButtonService: AndroidBackButtonService
  ) {
    this.androidBackButtonService
      .closeMatDialog$(dialogRef)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  openFriendInvitationDialog() {
    const nestedDialogRef = this.dialog.open(FriendInvitationDialogComponent, {
      minWidth: '90%',
      data: { email: '' },
    });
    nestedDialogRef
      .afterClosed()
      .pipe(isNonNullable(), untilDestroyed(this))
      .subscribe(result => this.dialogRef.close(result));
  }

  onCancelClicked() {
    this.dialogRef.close();
  }
}
