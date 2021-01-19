import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { BlockingActionService } from '../../../../shared/services/blocking-action/blocking-action.service';
import { DiaBackendAssetPrefetchingService } from '../../../../shared/services/dia-backend/asset/prefetching/dia-backend-asset-prefetching.service';
import { OnboardingService } from '../../../../shared/services/onboarding/onboarding.service';
import { switchTapTo } from '../../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-prefetching',
  templateUrl: './prefetching.page.html',
  styleUrls: ['./prefetching.page.scss'],
})
export class PrefetchingPage {
  constructor(
    private readonly diaBackendAssetPrefetchingService: DiaBackendAssetPrefetchingService,
    private readonly router: Router,
    private readonly blockingActionService: BlockingActionService,
    private readonly onboardingService: OnboardingService
  ) {}

  prefetch() {
    this.blockingActionService
      .run$(
        defer(async () => {
          await this.diaBackendAssetPrefetchingService.prefetch();
          this.router.navigate(['/home']);
        })
      )
      .pipe(
        switchTapTo(
          defer(() =>
            this.onboardingService.setHasPrefetchedDiaBackendAssets(true)
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async skip() {
    await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
    return this.router.navigate(['/home']);
  }
}
