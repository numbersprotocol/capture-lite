import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { DefaultSignatureProvider } from 'src/app/services/collector/signature/default-provider/default-provider';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-defaultsignature',
  templateUrl: './defaultsignature.page.html',
  styleUrls: ['./defaultsignature.page.scss'],
})
export class DefaultSignaturePage {

  readonly publicKey$ = DefaultSignatureProvider.getPublicKey$();
  readonly privateKey$ = DefaultSignatureProvider.getPrivateKey$();
}
