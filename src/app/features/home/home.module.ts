import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../shared/core/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../shared/shared.module';
import { CaptureItemComponent } from './capture-tab/capture-item/capture-item.component';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [SharedModule, HomePageRoutingModule, PostCaptureCardModule],
  declarations: [
    HomePage,
    CaptureTabComponent,
    CaptureItemComponent,
    UploadingBarComponent,
  ],
})
export class HomePageModule {}
