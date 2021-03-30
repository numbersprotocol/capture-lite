import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { iif } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
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

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly networkService: NetworkService
  ) {}

  // tslint:disable-next-line: prefer-function-over-method
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }
}
