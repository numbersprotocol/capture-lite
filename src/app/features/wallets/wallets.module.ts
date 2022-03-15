import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { WalletsPageRoutingModule } from './wallets-routing.module';
import { WalletsPage } from './wallets.page';

@NgModule({
  imports: [SharedModule, WalletsPageRoutingModule],
  declarations: [WalletsPage],
})
export class WalletsPageModule {}
