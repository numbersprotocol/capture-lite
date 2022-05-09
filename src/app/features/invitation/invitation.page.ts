import { Component, OnInit } from '@angular/core';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.page.html',
  styleUrls: ['./invitation.page.scss'],
})
export class InvitationPage implements OnInit {
  constructor(private readonly diaBackendAuthService: DiaBackendAuthService) {}

  readonly referralCode$ = this.diaBackendAuthService.referralCode$;

  ngOnInit() {}
}
