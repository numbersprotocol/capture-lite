import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OnboardingService } from '../../../../shared/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage {
  constructor(private readonly onboardingService: OnboardingService) {
    this.onboardingService.onboard$().pipe(untilDestroyed(this)).subscribe();
  }
}
