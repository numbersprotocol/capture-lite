import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { UploadBarComponent } from './upload-bar.component';

@NgModule({
  declarations: [UploadBarComponent],
  imports: [SharedModule],
  exports: [UploadBarComponent],
})
export class UploadBarModule {}
