import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { AvatarComponent } from './avatar/avatar.component';
import { CapacitorPluginsModule } from './capacitor-plugins/capacitor-plugins.module';
import { CaptureBackButtonComponent } from './capture-back-button/capture-back-button.component';
import { ContactSelectionDialogComponent } from './contact-selection-dialog/contact-selection-dialog.component';
import { FriendInvitationDialogComponent } from './contact-selection-dialog/friend-invitation-dialog/friend-invitation-dialog.component';
import { ExportPrivateKeyModalComponent } from './export-private-key-modal/export-private-key-modal.component';
import { IframeService } from './iframe/iframe.service';
import { MaterialModule } from './material/material.module';
import { MediaRebrandedComponent } from './media/component/media-rebranded.component';
import { MediaComponent } from './media/component/media.component';
import { MigratingDialogComponent } from './migration/migrating-dialog/migrating-dialog.component';
import { OnboardingPopUpDialogComponent } from './onboarding/onboarding-pop-up-dialog/onboarding-pop-up-dialog.component';
import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url/safe-resource-url.pipe';
import { StartsWithPipe } from './pipes/starts-with/starts-with.pipe';
import { SocialLoginButtonComponent } from './social-login-button/social-login-button.component';
import { UserGuideService } from './user-guide/user-guide.service';

const declarations = [
  MigratingDialogComponent,
  AvatarComponent,
  MediaComponent,
  MediaRebrandedComponent,
  StartsWithPipe,
  SafeResourceUrlPipe,
  ContactSelectionDialogComponent,
  FriendInvitationDialogComponent,
  ExportPrivateKeyModalComponent,
  OrderDetailDialogComponent,
  CaptureBackButtonComponent,
  OnboardingPopUpDialogComponent,
  SocialLoginButtonComponent,
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
  IframeService,
];

@NgModule({
  declarations,
  imports,
  providers,
  exports: [...declarations, ...imports],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
