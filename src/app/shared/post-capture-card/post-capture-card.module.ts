import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from '../shared.module';
import { PostCaptureCardComponent } from './post-capture-card.component';

@NgModule({
  declarations: [PostCaptureCardComponent],
  imports: [
    SharedModule,
    TranslocoModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [PostCaptureCardComponent],
})
export class PostCaptureCardModule {}
