import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { GoProMediaItemDetailOnCameraComponent } from './go-pro-media-item-detail-on-camera/go-pro-media-item-detail-on-camera.component';
import { GoProMediaItemDetailOnDeviceComponent } from './go-pro-media-item-detail-on-device/go-pro-media-item-detail-on-device.component';
import { GoProMediaListItemOnCameraComponent } from './go-pro-media-list-item-on-camera/go-pro-media-list-item-on-camera.component';
import { GoProMediaListItemOnDeviceComponent } from './go-pro-media-list-item-on-device/go-pro-media-list-item-on-device.component';
import { GoProMediaListOnCameraComponent } from './go-pro-media-list-on-camera/go-pro-media-list-on-camera.component';
import { GoProMediaListOnDeviceComponent } from './go-pro-media-list-on-device/go-pro-media-list-on-device.component';
import { GoProPageRoutingModule } from './go-pro-routing.module';
import { GoProPage } from './go-pro.page';

@NgModule({
  imports: [SharedModule, GoProPageRoutingModule],
  declarations: [
    GoProPage,

    GoProMediaListOnCameraComponent,
    GoProMediaListItemOnCameraComponent,
    GoProMediaItemDetailOnCameraComponent,

    GoProMediaListOnDeviceComponent,
    GoProMediaListItemOnDeviceComponent,
    GoProMediaItemDetailOnDeviceComponent,
  ],
})
export class GoProPageModule {}
