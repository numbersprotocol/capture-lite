import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PostCaptureCardModule } from '../../../../shared/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../../../shared/shared.module';
import { SendingPostCapturePageRoutingModule } from './sending-post-capture-routing.module';
import { SendingPostCapturePage } from './sending-post-capture.page';

@NgModule({
  imports: [
    SharedModule,
    SendingPostCapturePageRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    PostCaptureCardModule,
  ],
  declarations: [SendingPostCapturePage],
})
export class SendingPostCapturePageModule {}
