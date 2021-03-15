import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../shared/core/post-capture-card/post-capture-card.module';
import { SeriesCardComponent } from '../../shared/core/series-card/series-card.component';
import { SharedModule } from '../../shared/shared.module';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';
import { PostCaptureTabComponent } from './post-capture-tab/post-capture-tab.component';

@NgModule({
  imports: [SharedModule, HomePageRoutingModule, PostCaptureCardModule],
  declarations: [
    HomePage,
    CaptureTabComponent,
    PostCaptureTabComponent,
    PrefetchingDialogComponent,
    UploadingBarComponent,
    SeriesCardComponent,
  ],
})
export class HomePageModule {}
