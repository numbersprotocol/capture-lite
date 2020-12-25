import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OnboardingService } from '../../services/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  constructor(private readonly onboardingService: OnboardingService) {}

  ngOnInit() {
    this.onboardingService.onboard();
  }

  // tslint:disable-next-line: prefer-function-over-method prefer-method-signature no-inferred-empty-object-type
  next(slide: { slideTo: (arg0: number) => {} }, index: number) {
    // @ts-ignore
    // tslint:disable-next-line: no-inferred-empty-object-type
    slide.slideTo(index);
  }
}
