import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslocoModule } from '@ngneat/transloco';
import { PostCaptureCardComponent } from './post-capture-card.component';

@NgModule({
  declarations: [PostCaptureCardComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    TranslocoModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [PostCaptureCardComponent]
})
export class PostCaptureCardModule { }
