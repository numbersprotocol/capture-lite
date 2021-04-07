import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { iif } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendSeriesRepository } from '../../../shared/services/dia-backend/series/dia-backend-series-repository.service';
import { NetworkService } from '../../../shared/services/network/network.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-post-capture-tab',
  templateUrl: './post-capture-tab.component.html',
  styleUrls: ['./post-capture-tab.component.scss'],
})
export class PostCaptureTabComponent {
  categories: 'photo' | 'series' = 'photo';

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

  readonly seriesList$ = this.networkService.connected$.pipe(
    switchMap(isConnected =>
      iif(
        () => isConnected,
        this.diaBackendSeriesRepository.fetchSeriesList$.pipe(pluck('results'))
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
}
