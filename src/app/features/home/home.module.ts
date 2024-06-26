import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { SharedModule } from '../../shared/shared.module';
import { CaptureItemComponent } from './capture-tab/capture-item/capture-item.component';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { CollectionTabComponent } from './collection-tab/collection-tab/collection-tab.component';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { UpdateAppDialogComponent } from './in-app-updates/update-app-dialog/update-app-dialog.component';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';
import { PostCaptureTabComponent } from './post-capture-tab/post-capture-tab.component';

@NgModule({
  declarations: [
    HomePage,
    CaptureTabComponent,
    CollectionTabComponent,
    PostCaptureTabComponent,
    PrefetchingDialogComponent,
    UpdateAppDialogComponent,
    UploadingBarComponent,
    CaptureItemComponent,
  ],
  imports: [SharedModule, HomePageRoutingModule, JoyrideModule.forChild()],
})
export class HomePageModule {}
