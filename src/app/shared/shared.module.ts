import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { ReactiveComponentModule } from '@ngrx/component';
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

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class SharedModule {}
