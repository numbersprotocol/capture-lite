import { NgModule } from '@angular/core';

import { WhatAreActionsPageRoutingModule } from './what-are-actions-routing.module';

import { SharedModule } from '../../../../../shared/shared.module';
import { WhatAreActionsPage } from './what-are-actions.page';

@NgModule({
  imports: [SharedModule, WhatAreActionsPageRoutingModule],
  declarations: [WhatAreActionsPage],
})
export class WhatAreActionsPageModule {}
