import { Component } from '@angular/core';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';

@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.page.html',
  styleUrls: ['./user-guide.page.scss'],
})
export class UserGuidePage {
  readonly hasHighlightedCameraTab$ =
    this.userGuideService.hasHighlightedCameraTab$();

  readonly hasOpenedCustomCameraPage$ =
    this.userGuideService.hasOpenedCustomCameraPage$();

  readonly hasCapturedPhotoWithCustomCamera$ =
    this.userGuideService.hasCapturedPhotoWithCustomCamera$();

  readonly hasCapturedVideoWithCustomCamera$ =
    this.userGuideService.hasCapturedVideoWithCustomCamera$();

  readonly hasHighlightedFirstCapture$ =
    this.userGuideService.hasHighlightedFirstCapture$();

  readonly hasOpenedDetailsPage$ =
    this.userGuideService.hasOpenedDetailsPage$();

  readonly hasClickedDetailsPageOptionsMenu$ =
    this.userGuideService.hasClickedDetailsPageOptionsMenu$();

  readonly hasHighligtedActivityButton$ =
    this.userGuideService.hasHighligtedActivityButton$();

  readonly hasOpenedActivitiesPage$ =
    this.userGuideService.hasOpenedActivitiesPage$();

  readonly hasHightlightedInboxTab$ =
    this.userGuideService.hasHightlightedInboxTab$();

  readonly hasOpenedInboxTab$ = this.userGuideService.hasOpenedInboxTab$();

  constructor(private readonly userGuideService: UserGuideService) {}

  setHasHighlightedCameraTab(event: any) {
    this.userGuideService.setHasHighlightedCameraTab(event.detail.checked);
  }

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

  setHasHighlightedFirstCapture(event: any) {
    this.userGuideService.setHasHighlightedFirstCapture(event.detail.checked);
  }

  setHasOpenedDetailsPage(event: any) {
    this.userGuideService.setHasOpenedDetailsPage(event.detail.checked);
  }

  setHasClickedDetailsPageOptionsMenu(event: any) {
    this.userGuideService.setHasClickedDetailsPageOptionsMenu(
      event.detail.checked
    );
  }

  setHasHighligtedActivityButton(event: any) {
    this.userGuideService.setHasHighligtedActivityButton(event.detail.checked);
  }

  setHasOpenedActivitiesPage(event: any) {
    this.userGuideService.setHasOpenedActivitiesPage(event.detail.checked);
  }

  setHasHightlightedInboxTab(event: any) {
    this.userGuideService.setHasHightlightedInboxTab(event.detail.checked);
  }

  setHasOpenedInboxTab(event: any) {
    this.userGuideService.setHasOpenedInboxTab(event.detail.checked);
  }

  resetAll() {
    this.userGuideService.setHasHighlightedCameraTab(false);
    this.userGuideService.setHasOpenedCustomCameraPage(false);
    this.userGuideService.setHasOpenedCustomCameraPage(false);
    this.userGuideService.setHasCapturedPhotoWithCustomCamera(false);
    this.userGuideService.setHasCapturedVideoWithCustomCamera(false);
    this.userGuideService.setHasHighlightedFirstCapture(false);
    this.userGuideService.setHasOpenedDetailsPage(false);
    this.userGuideService.setHasClickedDetailsPageOptionsMenu(false);
    this.userGuideService.setHasHighligtedActivityButton(false);
    this.userGuideService.setHasOpenedActivitiesPage(false);
    this.userGuideService.setHasHightlightedInboxTab(false);
    this.userGuideService.setHasOpenedInboxTab(false);
  }
}
