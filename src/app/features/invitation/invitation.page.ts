import { Component, OnInit } from '@angular/core';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ShareService } from '../../shared/share/share.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.page.html',
  styleUrls: ['./invitation.page.scss'],
})
export class InvitationPage implements OnInit {
  readonly referralCode$ = this.diaBackendAuthService.referralCode$;

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.refetchReferralCode();
  }

  async refetchReferralCode() {
    const referralCode = await this.diaBackendAuthService.getReferralCode();
    if (!referralCode) await this.diaBackendAuthService.syncUser$().toPromise();
  }

  async shareReferralCode() {
    const referralCode = await this.diaBackendAuthService.getReferralCode();
    this.shareService.shareReferralCode(referralCode);
  }
}
