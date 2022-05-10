import { Component } from '@angular/core';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ShareService } from '../../shared/share/share.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.page.html',
  styleUrls: ['./invitation.page.scss'],
})
export class InvitationPage {
  readonly referralCode$ = this.diaBackendAuthService.referralCode$;

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly shareService: ShareService
  ) {}

  async shareReferralCode() {
    const referralCode = await this.diaBackendAuthService.getReferralCode();
    this.shareService.shareReferralCode(referralCode);
  }
}
