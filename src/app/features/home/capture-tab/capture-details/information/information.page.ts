import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, shareReplay } from 'rxjs/operators';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage {
  readonly asset$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly route: ActivatedRoute) {}
}
