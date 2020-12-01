import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AssetPageRoutingModule } from './asset-routing.module';
import { AssetPage } from './asset.page';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import { FriendInvitationDialogComponent } from './contact-selection-dialog/friend-invitation-dialog/friend-invitation-dialog.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';

@NgModule({
  imports: [SharedModule, AssetPageRoutingModule],
  declarations: [
    AssetPage,
    ContactSelectionDialogComponent,
    FriendInvitationDialogComponent,
    OptionsMenuComponent,
  ],
})
export class AssetPageModule {}
