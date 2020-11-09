import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslocoModule } from '@ngneat/transloco';
import { PostCaptureCardModule } from 'src/app/shared/post-capture-card/post-capture-card.module';
import { StoragePageRoutingModule } from './storage-routing.module';
import { StoragePage } from './storage.page';

@NgModule({
  imports: [
    CommonModule,
    StoragePageRoutingModule,
    TranslocoModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    PostCaptureCardModule
  ],
  declarations: [StoragePage]
})
export class StoragePageModule { }
