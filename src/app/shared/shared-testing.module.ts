import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MemoryTable } from '../services/database/table/memory-table/memory-table';
import { TABLE_IMPL } from '../services/database/table/table';
import { NotificationTestingService } from '../services/notification/notification-testing.service';
import { NotificationService } from '../services/notification/notification.service';
import { MemoryPreferences } from '../services/preference-manager/preferences/memory-preferences/memory-preferences';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';
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
  providers: [
    { provide: TABLE_IMPL, useValue: MemoryTable },
    { provide: PREFERENCES_IMPL, useValue: MemoryPreferences },
    { provide: NotificationService, useClass: NotificationTestingService },
  ],
  exports: [MaterialTestingModule],
})
export class SharedTestingModule {}
