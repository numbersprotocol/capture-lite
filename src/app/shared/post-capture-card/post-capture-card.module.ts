import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from '../shared.module';
import { PostCaptureCardComponent } from './post-capture-card.component';

@NgModule({
  declarations: [PostCaptureCardComponent],
  imports: [SharedModule, TranslocoModule],
  exports: [PostCaptureCardComponent],
})
export class PostCaptureCardModule {}
