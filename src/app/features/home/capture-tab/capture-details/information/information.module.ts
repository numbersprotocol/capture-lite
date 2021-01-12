import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { InformationPageRoutingModule } from './information-routing.module';
import { InformationPage } from './information.page';

@NgModule({
  imports: [SharedModule, InformationPageRoutingModule],
  declarations: [InformationPage],
})
export class InformationPageModule {}
