import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { InboxPageRoutingModule } from './inbox-routing.module';
import { InboxPage } from './inbox.page';

@NgModule({
  imports: [SharedModule, InboxPageRoutingModule],
  declarations: [InboxPage],
})
export class InboxPageModule {}
