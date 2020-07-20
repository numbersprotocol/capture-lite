import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProofPageRoutingModule } from './proof-routing.module';
import { ProofPage } from './proof.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProofPageRoutingModule,
    TranslateModule
  ],
  declarations: [ProofPage]
})
export class ProofPageModule { }
