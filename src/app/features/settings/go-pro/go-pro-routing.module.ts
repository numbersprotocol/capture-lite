import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoProMediaItemDetailOnCameraComponent } from './go-pro-media-item-detail-on-camera/go-pro-media-item-detail-on-camera.component';
import { GoProMediaListOnCameraComponent } from './go-pro-media-list-on-camera/go-pro-media-list-on-camera.component';
import { GoProMediaViewerWithNativePlayerComponent } from './go-pro-media-viewer-with-native-player/go-pro-media-viewer-with-native-player.component';
import { GoProPage } from './go-pro.page';

const routes: Routes = [
  {
    path: '',
    component: GoProPage,
  },
  {
    path: 'media-list-on-camera',
    component: GoProMediaListOnCameraComponent,
  },
  {
    path: 'media-item-detail-on-camera',
    component: GoProMediaItemDetailOnCameraComponent,
  },
  {
    path: 'media-item-viewer',
    component: GoProMediaViewerWithNativePlayerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoProPageRoutingModule {}
