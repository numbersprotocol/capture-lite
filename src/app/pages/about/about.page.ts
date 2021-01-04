import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { pluck } from 'rxjs/operators';

const { Device } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {
  readonly version$ = defer(() => Device.getInfo()).pipe(pluck('appVersion'));
}
