import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { NumbersStoragePageRoutingModule } from './numbers-storage-routing.module';
import { NumbersStoragePage } from './numbers-storage.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NumbersStoragePageRoutingModule,
    TranslocoModule
  ],
  declarations: [NumbersStoragePage]
})
export class NumbersStoragePageModule { }
