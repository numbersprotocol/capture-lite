import { NgModule } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MaterialModule } from './material.module';

const modules = [MatIconTestingModule];

@NgModule({
  imports: [MaterialModule, ...modules],
  exports: [MaterialModule, ...modules],
})
export class MaterialTestingModule {}
