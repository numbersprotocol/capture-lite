import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../shared/core/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../shared/shared.module';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadBarModule } from './capture-tab/upload-bar/upload-bar.module';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    SharedModule,
    HomePageRoutingModule,
    PostCaptureCardModule,
    UploadBarModule,
  ],
  declarations: [HomePage, CaptureTabComponent],
})
export class HomePageModule {}
