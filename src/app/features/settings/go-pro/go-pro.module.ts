import { NgModule } from '@angular/core';
import { NgxLongPress2Module } from 'ngx-long-press2';
import { SharedModule } from '../../../shared/shared.module';
import { GoProMediaItemDetailOnCameraComponent } from './go-pro-media-item-detail-on-camera/go-pro-media-item-detail-on-camera.component';
import { GoProMediaListItemOnCameraComponent } from './go-pro-media-list-item-on-camera/go-pro-media-list-item-on-camera.component';
import { GoProMediaListOnCameraComponent } from './go-pro-media-list-on-camera/go-pro-media-list-on-camera.component';
import { GoProMediaLoadingBarComponent } from './go-pro-media-loading-bar/go-pro-media-loading-bar.component';
import { GoProPageRoutingModule } from './go-pro-routing.module';
import { GoProPage } from './go-pro.page';

@NgModule({
  imports: [SharedModule, GoProPageRoutingModule, NgxLongPress2Module],
  declarations: [
    GoProPage,
    GoProMediaListOnCameraComponent,
    GoProMediaListItemOnCameraComponent,
    GoProMediaItemDetailOnCameraComponent,
    GoProMediaLoadingBarComponent,
  ],
})
export class GoProPageModule {}
