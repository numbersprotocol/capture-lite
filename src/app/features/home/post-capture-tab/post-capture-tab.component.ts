import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IPageInfo } from 'ngx-virtual-scroller';
import { BehaviorSubject } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  first,
  map,
  tap,
} from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { Pagination } from '../../../shared/services/dia-backend/pagination/pagination';
import { NetworkService } from '../../../shared/services/network/network.service';

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
  private readonly paginationSize = 10;
  private readonly _postCaptures$ = new BehaviorSubject<DiaBackendAsset[]>([]);
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _pagination$ = new BehaviorSubject<
    Pagination<DiaBackendAsset> | undefined
  >(undefined);
  readonly focus$ = this._focus$.asObservable().pipe(distinctUntilChanged());
  readonly postCaptures$ = this._postCaptures$.asObservable();
  readonly pagination$ = this._pagination$.asObservable();
  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly networkService: NetworkService
  ) {}

  ngOnInit() {
    this.focus$
      .pipe(
        filter(focus => !!focus),
        concatMap(() => this.fetchPostCaptures$()),
        tap(postCapture => this._postCaptures$.next(postCapture)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  fetchPostCaptures$(overrideUrl?: string) {
    return this.diaBackendAssetRepository
      .fetchPostCapturePagination$(this.paginationSize, overrideUrl)
      .pipe(
        tap(pagination => this._pagination$.next(pagination)),
        map(pagination => pagination.results),
        map(assets => assets.filter(asset => !!asset.source_transaction))
      );
  }

  loadNextPage(event: IPageInfo) {
    if (event.endIndex !== this._postCaptures$.getValue().length - 1) {
      return;
    }
    this.pagination$
      .pipe(
        first(),
        filter(pagination => !!pagination?.next),
        concatMap(pagination => this.fetchPostCaptures$(pagination?.next)),
        tap(newPostCaptures => this.concatPostCaptures(newPostCaptures)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }

  private concatPostCaptures(postCaptures: DiaBackendAsset[]) {
    this._postCaptures$.next(
      this._postCaptures$.getValue().concat(postCaptures)
    );
  }
}
