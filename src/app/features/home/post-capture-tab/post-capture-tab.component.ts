import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { iif } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import {
  DiaBackendSeries,
  DiaBackendSeriesRepository,
} from '../../../shared/services/dia-backend/series/dia-backend-series-repository.service';
import { NetworkService } from '../../../shared/services/network/network.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-post-capture-tab',
  templateUrl: './post-capture-tab.component.html',
  styleUrls: ['./post-capture-tab.component.scss'],
})
export class PostCaptureTabComponent {
  categories = 'Photo';

  readonly networkConnected$ = this.networkService.connected$;

  readonly postCaptures$ = this.networkConnected$.pipe(
    switchMap(isConnected =>
      iif(
        () => isConnected,
        this.diaBackendAssetRepository.postCaptures$.pipe(
          pluck('results'),
          map(assets => assets.filter(a => a.source_transaction))
        )
      )
    )
  );

  // collected=True
  readonly getSeries$ = this.networkService.connected$.pipe(
    switchMap(isConnected =>
      iif(
        () => isConnected,
        this.diaBackendSeriesRepository.readSeries$().pipe(
          pluck('results')
          // tap(v => console.log(v)),
          // map(series => series.filter(a => a.in_store == true))
        )
      )
    )
  );

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendSeriesRepository: DiaBackendSeriesRepository,
    private readonly networkService: NetworkService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }
  trackSeries(_: number, item: DiaBackendSeries) {
    return item.id;
  }
}
