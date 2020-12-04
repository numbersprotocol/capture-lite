import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { getTranslocoTestingModule } from '../services/transloco/transloco-testing.module';
import { CapacitorPluginsTestingModule } from './capacitor-plugins/capacitor-plugins-testing.module';
import { MaterialTestingModule } from './material/material-testing.module';
import { SharedModule } from './shared.module';

@NgModule({
  imports: [
    SharedModule,
    IonicModule.forRoot(),
    HttpClientTestingModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    getTranslocoTestingModule(),
    MaterialTestingModule,
    CapacitorPluginsTestingModule,
  ],
  exports: [MaterialTestingModule],
})
export class SharedTestingModule {}
