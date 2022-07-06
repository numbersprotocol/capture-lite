import { NgModule } from '@angular/core';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { SharedModule } from '../../../shared/shared.module';
import { TransferLoadingComponent } from './transfer-loading/transfer-loading.component';
import { TransferRequestSentComponent } from './transfer-request-sent/transfer-request-sent.component';
import { TransferPageRoutingModule } from './transfer-routing.module';
import { TransferPage } from './transfer.page';

@NgModule({
  imports: [SharedModule, TransferPageRoutingModule, NgxQRCodeModule],
  declarations: [
    TransferPage,
    TransferLoadingComponent,
    TransferRequestSentComponent,
  ],
})
export class TransferPageModule {}
