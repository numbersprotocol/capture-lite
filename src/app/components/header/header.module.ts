import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { SettingsPageRoutingModule } from 'src/app/pages/settings/settings-routing.module';
import { HeaderComponent } from './header.component';


@NgModule({
  imports: [
    TranslocoModule,
    IonicModule,
    CommonModule,
    SettingsPageRoutingModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule { }
