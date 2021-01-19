import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PrefetchingPageRoutingModule } from './prefetching-routing.module';
import { PrefetchingPage } from './prefetching.page';

@NgModule({
  imports: [SharedModule, PrefetchingPageRoutingModule],
  declarations: [PrefetchingPage],
})
export class PrefetchingPageModule {}
