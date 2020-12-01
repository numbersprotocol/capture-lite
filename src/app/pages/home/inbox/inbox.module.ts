import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../../shared/shared.module';
import { InboxPageRoutingModule } from './inbox-routing.module';
import { InboxPage } from './inbox.page';

@NgModule({
  imports: [
    SharedModule,
    InboxPageRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  declarations: [InboxPage],
})
export class InboxPageModule {}
