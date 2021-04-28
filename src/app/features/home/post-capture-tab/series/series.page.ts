import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ErrorService } from '../../../../shared/modules/error/error.service';
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
    switchMap(id => this.diaBackendSeriesRepository.fetchById$(id)),
    catchError((err: unknown) => this.errorService.toastError$(err))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendSeriesRepository: DiaBackendSeriesRepository,
    private readonly errorService: ErrorService
  ) {}
}
