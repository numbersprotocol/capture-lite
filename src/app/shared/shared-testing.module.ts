import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule } from '@ngneat/transloco';
import { CapacitorPluginsTestingModule } from './capacitor-plugins/capacitor-plugins-testing.module';
import { getTranslocoTestingModule } from './language/transloco/transloco-testing.module';
import { MaterialTestingModule } from './material/material-testing.module';
import { SharedModule } from './shared.module';
import { getJoyrideModuleForRoot } from './user-guide/user-guide.module';

@NgModule({
  imports: [
    SharedModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    getTranslocoTestingModule(),
    MaterialTestingModule,
    CapacitorPluginsTestingModule,
    getJoyrideModuleForRoot(),
  ],
  exports: [
    SharedModule,
    RouterTestingModule,
    TranslocoModule,
    MaterialTestingModule,
  ],
})
export class SharedTestingModule {}
