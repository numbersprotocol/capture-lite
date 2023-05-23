import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface OnboardingPopUpDialogData {
  title: string;
  content: string;
  close: string;
}

@Component({
  selector: 'app-encourage-take-photo-dialog',
  templateUrl: './onboarding-pop-up-dialog.component.html',
  styleUrls: ['./onboarding-pop-up-dialog.component.scss'],
})
export class OnboardingPopUpDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OnboardingPopUpDialogData
  ) {}
}
