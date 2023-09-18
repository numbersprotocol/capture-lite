import { NgModule } from '@angular/core';

import { EditProfilePageRoutingModule } from './edit-profile-routing.module';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedModule } from '../../../shared/shared.module';
import { EditProfilePage } from './edit-profile.page';
import { ImageInputFormComponent } from './image-input-form/image-input-form.component';

@NgModule({
  imports: [
    SharedModule,
    EditProfilePageRoutingModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  declarations: [EditProfilePage, ImageInputFormComponent],
})
export class EditProfilePageModule {}
