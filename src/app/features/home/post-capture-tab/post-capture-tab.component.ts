import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, defer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { NetworkService } from '../../../shared/services/network/network.service';
import { OldDefaultInformationName } from '../../../shared/services/repositories/proof/old-proof-adapter';
import { isNonNullable, VOID$ } from '../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-post-capture-tab',
  templateUrl: './post-capture-tab.component.html',
  styleUrls: ['./post-capture-tab.component.scss'],
})
export class PostCaptureTabComponent implements OnInit {
  @Input('focus') set focus(focus: boolean) {
    this._focus$.next(focus);
  }

  private readonly _focus$ = new BehaviorSubject(false);

  readonly focus$ = this._focus$.pipe(distinctUntilChanged());

  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _postCaptures$ = new BehaviorSubject<
    PostCaptureItem[] | undefined
  >(undefined);

  readonly postCaptures$ = this._postCaptures$.pipe(
    isNonNullable(),
    distinctUntilChanged()
  );

  readonly networkConnected$ = this.networkService.connected$;

  readonly onDidNavigate$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd && event?.url === '/home'),
    startWith(undefined)
  );

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly networkService: NetworkService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    combineLatest([this.focus$, this.onDidNavigate$])
      .pipe(
        filter(([focus]) => focus),
        switchMapTo(defer(() => this.fetchPostCaptures$())),
        catchError(err => {
          console.error(err);
          return VOID$;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  fetchPostCaptures$() {
    return this.diaBackendAssetRepository.fetchPostCaptures$().pipe(
      first(),
      map(pagination => pagination.results),
      map(assets => assets.filter(asset => asset.source_transaction)),
      map(assets =>
        assets.map<PostCaptureItem>(asset => ({
          oldProofHash: asset.proof_hash,
          thumbnailUrl: asset.asset_file_thumbnail,
          hasGeolocation: !!asset.information.information?.find(
            info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
          ),
        }))
      ),
      tap(postCapture => this._postCaptures$.next(postCapture))
    );
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }
}

interface PostCaptureItem {
  readonly oldProofHash: string;
  readonly thumbnailUrl: string;
  readonly hasGeolocation: boolean;
}
