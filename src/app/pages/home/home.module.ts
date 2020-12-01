import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../shared/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../shared/shared.module';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [SharedModule, HomePageRoutingModule, PostCaptureCardModule],
  declarations: [HomePage],
})
export class HomePageModule {}
