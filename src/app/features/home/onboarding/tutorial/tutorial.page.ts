import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OnboardingService } from '../../../../shared/services/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  constructor(private readonly onboardingService: OnboardingService) {}

  ngOnInit() {
    this.onboardingService.onboard();
  }
}
