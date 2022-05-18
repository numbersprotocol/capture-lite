import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage {
  constructor(private readonly userGuideService: UserGuideService) {}

  async ionViewDidEnter() {
    await this.userGuideService.showUserGuidesOnActivitiesPage();
    await this.userGuideService.setHasOpenedActivitiesPage(true);
  }
}
