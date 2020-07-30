import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { StoragePageRoutingModule } from './storage-routing.module';
import { StoragePage } from './storage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoragePageRoutingModule,
    TranslocoModule
  ],
  declarations: [StoragePage]
})
export class StoragePageModule { }
