import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { DiaBackendSeriesRepository } from '../../../../shared/services/dia-backend/series/dia-backend-series-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
@Component({
  selector: 'app-series',
  templateUrl: './series.page.html',
  styleUrls: ['./series.page.scss'],
})
export class SeriesPage {
  private readonly id$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable()
  );

  readonly series$ = this.id$.pipe(
    switchMap(id => this.diaBackendSeriesRepository.fetchById$(id))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendSeriesRepository: DiaBackendSeriesRepository
  ) {}
}
