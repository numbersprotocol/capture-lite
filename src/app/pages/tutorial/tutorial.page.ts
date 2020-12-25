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
  constructor(private readonly onboardingService: OnboardingService) {}
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  next(slide: { slideTo: (arg0: any) => void }, index: any) {
    slide.slideTo(index);
  }

  ngOnInit() {
    this.onboardingService.onboard();
  }
}
