import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, tap } from 'rxjs/operators';
import { CaptureService } from '../../shared/services/capture/capture.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OnboardingService } from '../../shared/services/onboarding/onboarding.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  readonly username$ = this.diaBackendAuthService.getUsername$;
  readonly inboxCount$ = this.diaBackendTransactionRepository.getInbox$().pipe(
    map(transactions => transactions.length),
    // WORKARDOUND: force changeDetection to update badge when returning to App by clicking push notification
    tap(() => this.changeDetectorRef.detectChanges())
  );
  postCaptureTabFocus = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router,
    private readonly captureService: CaptureService
  ) {}

  async ngOnInit() {
    if (await this.onboardingService.isOnboarding()) {
      this.router.navigate(['/tutorial']);
    }
  }

  async capture() {
    return this.captureService.capture();
  }

  onTapChanged(event: MatTabChangeEvent) {
    this.postCaptureTabFocus = event.index === 1;
  }
}
