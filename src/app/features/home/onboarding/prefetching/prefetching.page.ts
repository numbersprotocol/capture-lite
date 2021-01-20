import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { DiaBackendAssetPrefetchingService } from '../../../../shared/services/dia-backend/asset/prefetching/dia-backend-asset-prefetching.service';
import { OnboardingService } from '../../../../shared/services/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-prefetching',
  templateUrl: './prefetching.page.html',
  styleUrls: ['./prefetching.page.scss'],
})
export class PrefetchingPage {
  progress = 0;

  constructor(
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly router: Router,
    private readonly onboardingService: OnboardingService
  ) {
    this.prefetch();
  }

  private async prefetch() {
    await this.diaBackendAssetPrefetchingService.prefetch(
      (currentCount, totalCount) => (this.progress = currentCount / totalCount)
    );
    await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    this.router.navigate(['/home']);
  }
}
