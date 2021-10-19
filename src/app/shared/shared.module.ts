import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { ReactiveComponentModule } from '@ngrx/component';
import { GoProBluetoothService } from '../features/settings/go-pro/services/go-pro-bluetooth.service';
import { GoProMediaService } from '../features/settings/go-pro/services/go-pro-media.service';
import { GoProWifiService } from '../features/settings/go-pro/services/go-pro-wifi.service';
import { AvatarComponent } from './avatar/avatar.component';
import { CapacitorPluginsModule } from './capacitor-plugins/capacitor-plugins.module';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import { FriendInvitationDialogComponent } from './contact-selection-dialog/friend-invitation-dialog/friend-invitation-dialog.component';
import { MaterialModule } from './material/material.module';
import { MediaComponent } from './media/component/media.component';
import { MigratingDialogComponent } from './migration/migrating-dialog/migrating-dialog.component';
import { StartsWithPipe } from './pipes/starts-with/starts-with.pipe';

const declarations = [
  MigratingDialogComponent,
  AvatarComponent,
  MediaComponent,
  StartsWithPipe,
  ContactSelectionDialogComponent,
  FriendInvitationDialogComponent,
];

const imports = [
  CommonModule,
  IonicModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  TranslocoModule,
  MaterialModule,
  CapacitorPluginsModule,
  ReactiveComponentModule,
];

const providers = [GoProBluetoothService, GoProWifiService, GoProMediaService];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [...declarations, ...imports],
})
export class SharedModule {}
