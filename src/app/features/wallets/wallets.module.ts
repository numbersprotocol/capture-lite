import { NgModule } from '@angular/core';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { SharedModule } from '../../shared/shared.module';
import { WalletsPageRoutingModule } from './wallets-routing.module';
import { WalletsPage } from './wallets.page';

@NgModule({
  imports: [SharedModule, WalletsPageRoutingModule, NgxQRCodeModule],
  declarations: [WalletsPage],
})
export class WalletsPageModule {}
