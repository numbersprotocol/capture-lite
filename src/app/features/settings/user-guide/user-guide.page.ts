import { Component } from '@angular/core';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';

@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.page.html',
  styleUrls: ['./user-guide.page.scss'],
})
export class UserGuidePage {
  readonly hasOpenedCustomCameraPage$ =
    this.userGuideService.hasOpenedCustomCameraPage$();

  readonly hasCapturedPhotoWithCustomCamera$ =
    this.userGuideService.hasCapturedPhotoWithCustomCamera$();

  readonly hasCapturedVideoWithCustomCamera$ =
    this.userGuideService.hasCapturedVideoWithCustomCamera$();

  readonly hasOpenedDetailsPage$ =
    this.userGuideService.hasOpenedDetailsPage$();

  readonly hasClickedDetailsPageOptionsMenu$ =
    this.userGuideService.hasClickedDetailsPageOptionsMenu$();

  readonly hasOpenedActivitiesPage$ =
    this.userGuideService.hasOpenedActivitiesPage$();

  readonly hasOpenedInboxTab$ = this.userGuideService.hasOpenedInboxTab$();

  constructor(private readonly userGuideService: UserGuideService) {}

  setHasOpenedCustomCameraPage(event: any) {
    this.userGuideService.setHasOpenedCustomCameraPage(event.detail.checked);
  }

  setHasCapturedPhotoWithCustomCamera(event: any) {
    this.userGuideService.setHasCapturedPhotoWithCustomCamera(
      event.detail.checked
    );
  }

  setHasCapturedVideoWithCustomCamera(event: any) {
    this.userGuideService.setHasCapturedVideoWithCustomCamera(
      event.detail.checked
    );
  }

  setHasOpenedDetailsPage(event: any) {
    this.userGuideService.setHasOpenedDetailsPage(event.detail.checked);
  }

  setHasClickedDetailsPageOptionsMenu(event: any) {
    this.userGuideService.setHasClickedDetailsPageOptionsMenu(
      event.detail.checked
    );
  }

  setHasOpenedActivitiesPage(event: any) {
    this.userGuideService.setHasOpenedActivitiesPage(event.detail.checked);
  }

  setHasOpenedInboxTab(event: any) {
    this.userGuideService.setHasOpenedInboxTab(event.detail.checked);
  }

  resetAll() {
    this.userGuideService.setHasOpenedCustomCameraPage(false);
    this.userGuideService.setHasOpenedCustomCameraPage(false);
    this.userGuideService.setHasCapturedPhotoWithCustomCamera(false);
    this.userGuideService.setHasCapturedVideoWithCustomCamera(false);
    this.userGuideService.setHasOpenedDetailsPage(false);
    this.userGuideService.setHasClickedDetailsPageOptionsMenu(false);
    this.userGuideService.setHasOpenedActivitiesPage(false);
    this.userGuideService.setHasOpenedInboxTab(false);
  }
}
