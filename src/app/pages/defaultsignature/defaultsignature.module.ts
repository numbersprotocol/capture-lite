import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { DefaultSignaturePageRoutingModule } from './defaultsignature-routing.module';
import { DefaultSignaturePage } from './defaultsignature.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefaultSignaturePageRoutingModule,
    TranslocoModule
  ],
  declarations: [DefaultSignaturePage]
})
export class DefaultSignaturePageModule { }
