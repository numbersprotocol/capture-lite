import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IPageInfo } from 'ngx-virtual-scroller';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { Pagination } from '../../../shared/services/dia-backend/pagination/pagination';
import { NetworkService } from '../../../shared/services/network/network.service';
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
  private readonly paginationSize = 10;
  private readonly _postCaptures$ = new BehaviorSubject<DiaBackendAsset[]>([]);
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _pagination$ = new BehaviorSubject<
    Pagination<DiaBackendAsset> | undefined
  >(undefined);
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _loadNextPageEvent$ = new Subject<IPageInfo>();
  private readonly _isLoadingNextPage$ = new BehaviorSubject(false);
  readonly focus$ = this._focus$.asObservable().pipe(distinctUntilChanged());
  readonly postCaptures$ = this._postCaptures$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly pagination$ = this._pagination$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly loadNextPageEvent$ = this._loadNextPageEvent$.asObservable().pipe(
    isNonNullable(),
    concatMap(event =>
      combineLatest([of(event), this.postCaptures$, this.pagination$]).pipe(
        first()
      )
    ),
    filter(
      ([event, postCaptures, pagination]) =>
        event.endIndex === postCaptures.length - 1 && !!pagination?.next
    ),
    map(([e, p, pagination]) => pagination)
  );
  readonly isLoadingNextPage$ = this._isLoadingNextPage$
    .asObservable()
    .pipe(distinctUntilChanged());
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
        filter(([focus, _]) => !!focus),
        switchMap(() =>
          this.fetchPostCaptures$().pipe(
            tap(postCapture => this._postCaptures$.next(postCapture)),
            concatMap(() => this.loadNextPageEventHandler$())
          )
        ),
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
        map(assets => assets.filter(asset => !!asset.source_transaction)),
        catchError(err => {
          console.error(err);
          return of([]);
        })
      );
  }

  loadNextPage(event: IPageInfo) {
    this._loadNextPageEvent$.next(event);
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }

  private concatPostCaptures(postCaptures: DiaBackendAsset[]) {
    this._postCaptures$.next(this._postCaptures$.value.concat(postCaptures));
  }

  private loadNextPageEventHandler$() {
    const loadData$ = this.pagination$.pipe(
      first(),
      concatMap(pagination => this.fetchPostCaptures$(pagination?.next)),
      tap(newPostCaptures => this.concatPostCaptures(newPostCaptures))
    );
    return this.loadNextPageEvent$.pipe(
      concatMap(() => this.isLoadingNextPage$.pipe(first())),
      filter(isLoadingNextPage => !isLoadingNextPage),
      tap(() => this._isLoadingNextPage$.next(true)),
      concatMap(() => loadData$),
      tap(() => this._isLoadingNextPage$.next(false)),
      catchError(err => {
        this._isLoadingNextPage$.next(false);
        console.error(err);
        return VOID$;
      }),
      untilDestroyed(this)
    );
  }
}
