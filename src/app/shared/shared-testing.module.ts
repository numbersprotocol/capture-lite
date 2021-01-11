import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { CapacitorPluginsTestingModule } from './core/capacitor-plugins/capacitor-plugins-testing.module';
import { MaterialTestingModule } from './core/material/material-testing.module';
import { getTranslocoTestingModule } from './core/transloco/transloco-testing.module';
import { SharedModule } from './shared.module';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
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
