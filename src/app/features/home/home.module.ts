import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CaptureItemComponent } from './capture-tab/capture-item/capture-item.component';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';
import { PostCaptureTabComponent } from './post-capture-tab/post-capture-tab.component';

@NgModule({
  declarations: [
    HomePage,
    CaptureTabComponent,
    PostCaptureTabComponent,
    PrefetchingDialogComponent,
    UploadingBarComponent,
    CaptureItemComponent,
  ],
  imports: [SharedModule, HomePageRoutingModule],
})
export class HomePageModule {}
