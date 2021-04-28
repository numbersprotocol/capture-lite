import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CaptureDetailsPageRoutingModule } from './capture-details-routing.module';
import { CaptureDetailsPage } from './capture-details.page';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import { FriendInvitationDialogComponent } from './contact-selection-dialog/friend-invitation-dialog/friend-invitation-dialog.component';

@NgModule({
  imports: [SharedModule, CaptureDetailsPageRoutingModule],
  declarations: [
    CaptureDetailsPage,
    ContactSelectionDialogComponent,
    FriendInvitationDialogComponent,
  ],
})
export class CaptureDetailsPageModule {}
