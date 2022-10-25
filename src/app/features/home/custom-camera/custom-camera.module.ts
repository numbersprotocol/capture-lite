import { NgModule } from '@angular/core';
import { AngularPinturaModule } from '@pqina/angular-pintura';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { JoyrideModule } from 'ngx-joyride';
import { NgxLongPress2Module } from 'ngx-long-press2';
import { SharedModule } from '../../../shared/shared.module';
import { CustomCameraPageRoutingModule } from './custom-camera-routing.module';
import { CustomCameraPage } from './custom-camera.page';
import { CustomCameraService } from './custom-camera.service';
import { PrePublishModeComponent } from './pre-publish-mode/pre-publish-mode.component';

@NgModule({
  imports: [
    SharedModule,
    CustomCameraPageRoutingModule,
    NgxLongPress2Module,
    NgCircleProgressModule.forRoot({}),
    JoyrideModule.forChild(),
    AngularPinturaModule,
  ],
  providers: [CustomCameraService],
  declarations: [CustomCameraPage, PrePublishModeComponent],
})
export class CustomCameraPageModule {}
