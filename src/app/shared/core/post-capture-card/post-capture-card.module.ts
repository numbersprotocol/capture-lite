import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from '../../shared.module';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { PostCaptureCardComponent } from './post-capture-card.component';

@NgModule({
  declarations: [PostCaptureCardComponent, OptionsMenuComponent],
  imports: [SharedModule, TranslocoModule],
  exports: [PostCaptureCardComponent],
})
export class PostCaptureCardModule {}
