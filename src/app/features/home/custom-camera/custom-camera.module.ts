import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { JoyrideModule } from 'ngx-joyride';
import { NgxLongPress2Module } from 'ngx-long-press2';
import { SharedModule } from '../../../shared/shared.module';
import { CustomCameraPageRoutingModule } from './custom-camera-routing.module';
import { CustomCameraPage } from './custom-camera.page';
import { CustomCameraService } from './custom-camera.service';

@NgModule({
  imports: [
    SharedModule,
    CustomCameraPageRoutingModule,
    NgxLongPress2Module,
    NgCircleProgressModule.forRoot({}),
    JoyrideModule.forChild(),
  ],
  providers: [CustomCameraService],
  declarations: [CustomCameraPage],
})
export class CustomCameraPageModule {}
