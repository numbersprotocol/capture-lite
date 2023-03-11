import { Component, ViewChild } from '@angular/core';
import { IonSlides, NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OnboardingService } from '../../../../shared/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage {
  isLastSlide = false;

  @ViewChild('slides') slides?: IonSlides;

  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly navController: NavController
  ) {
    this.onboardingService.onboard$().pipe(untilDestroyed(this)).subscribe();
  }

  async ionSlideDidChange(_: any) {
    if (!this.slides) return;

    const curSlideIndex = await this.slides.getActiveIndex();
    const totalSlides = await this.slides.length();

    this.isLastSlide = curSlideIndex === totalSlides - 1;
  }

  async skipSlides() {
    if (!this.slides) return;

    const totalSlides = await this.slides.length();
    await this.slides.slideTo(totalSlides - 1);
  }

  closeTutorialPage() {
    this.navController.back();
  }
}
