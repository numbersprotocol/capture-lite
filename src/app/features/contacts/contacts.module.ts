import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ContactsPageRoutingModule } from './contacts-routing.module';
import { ContactsPage } from './contacts.page';

@NgModule({
  imports: [SharedModule, ContactsPageRoutingModule],
  declarations: [ContactsPage],
})
export class ContactsPageModule {}
