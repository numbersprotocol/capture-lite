import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { OnboardingPageRoutingModule } from './onboarding-routing.module';
import { OnboardingPage } from './onboarding.page';

@NgModule({
  imports: [SharedModule, OnboardingPageRoutingModule],
  declarations: [OnboardingPage],
})
export class OnboardingPageModule {}
