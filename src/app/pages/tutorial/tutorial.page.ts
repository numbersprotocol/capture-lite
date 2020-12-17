import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { pluck } from 'rxjs/operators';

const { Device } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage {
  readonly version$ = defer(() => Device.getInfo()).pipe(
    pluck('appVersion'),
    untilDestroyed(this)
  );
}
