import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { HeaderModule } from 'src/app/components/header/header.module';
import { StoragePageRoutingModule } from './storage-routing.module';
import { StoragePage } from './storage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoragePageRoutingModule,
    TranslocoModule,
    HeaderModule
  ],
  declarations: [StoragePage]
})
export class StoragePageModule { }
