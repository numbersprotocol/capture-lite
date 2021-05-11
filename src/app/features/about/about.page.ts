import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { VersionService } from '../../shared/version/version.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {
  readonly version$ = this.versionService.version$;

  constructor(private readonly versionService: VersionService) {}
}
