import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { DefaultInformationProviderPageRoutingModule } from './defaultinformationprovider-routing.module';
import { DefaultInformationProviderPage } from './defaultinformationprovider.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefaultInformationProviderPageRoutingModule,
    TranslocoModule
  ],
  declarations: [DefaultInformationProviderPage]
})
export class DefaultInformationProviderPageModule { }
