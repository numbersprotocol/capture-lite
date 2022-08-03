import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { GoProBluetoothService } from '../features/settings/go-pro/services/go-pro-bluetooth.service';
import { GoProMediaService } from '../features/settings/go-pro/services/go-pro-media.service';
import { GoProWifiService } from '../features/settings/go-pro/services/go-pro-wifi.service';
import { ActionsDialogComponent } from './actions/actions-dialog/actions-dialog.component';
import { AvatarComponent } from './avatar/avatar.component';
import { CapacitorPluginsModule } from './capacitor-plugins/capacitor-plugins.module';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import { FriendInvitationDialogComponent } from './contact-selection-dialog/friend-invitation-dialog/friend-invitation-dialog.component';
import { ExportPrivateKeyModalComponent } from './export-private-key-modal/export-private-key-modal.component';
import { MaterialModule } from './material/material.module';
import { MediaComponent } from './media/component/media.component';
import { MigratingDialogComponent } from './migration/migrating-dialog/migrating-dialog.component';
import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url/safe-resource-url.pipe';
import { StartsWithPipe } from './pipes/starts-with/starts-with.pipe';
import { UserGuideService } from './user-guide/user-guide.service';

const declarations = [
  MigratingDialogComponent,
  ActionsDialogComponent,
  AvatarComponent,
  MediaComponent,
  StartsWithPipe,
  SafeResourceUrlPipe,
  ContactSelectionDialogComponent,
  FriendInvitationDialogComponent,
  ExportPrivateKeyModalComponent,
  OrderDetailDialogComponent,
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
  MatDialogModule,
  FormlyModule,
  FormlyMaterialModule,
];

const providers = [
  GoProBluetoothService,
  GoProWifiService,
  GoProMediaService,
  UserGuideService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [...declarations, ...imports],
})
export class SharedModule {}
