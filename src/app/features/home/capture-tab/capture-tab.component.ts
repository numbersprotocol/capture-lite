import { formatDate, KeyValue } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, iif } from 'rxjs';
import { catchError, finalize, map, pluck, switchMap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAsseRefreshingService } from '../../../shared/dia-backend/asset/refreshing/dia-backend-asset-refreshing.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../../shared/error/error.service';
import { NetworkService } from '../../../shared/network/network.service';
import { getOldProof } from '../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-capture-tab',
  templateUrl: './capture-tab.component.html',
  styleUrls: ['./capture-tab.component.scss'],
})
export class CaptureTabComponent {
  categories: 'validated' | 'collected' = 'validated';

  readonly username$ = this.diaBackendAuthService.username$;

  readonly email$ = this.diaBackendAuthService.email$;

  private readonly proofs$ = this.proofRepository.all$;

  readonly capturesByDate$ = this.proofs$.pipe(
    map(proofs => proofs.sort((a, b) => b.timestamp - a.timestamp)),
    map(proofs =>
      groupBy(proofs, proof =>
        formatDate(proof.timestamp, 'yyyy/MM/dd', 'en-US')
      )
    )
  );

  readonly captures$ = this.proofs$.pipe(
    map(proofs => proofs.sort((a, b) => b.timestamp - a.timestamp))
  );

  readonly networkConnected$ = this.networkService.connected$;

  readonly postCaptures$ = this.networkConnected$.pipe(
    switchMap(isConnected =>
      iif(
        () => isConnected,
        this.diaBackendAssetRepository.postCaptures$.pipe(pluck('results'))
      )
    ),
    catchError((err: unknown) => this.errorService.toastError$(err))
  );

  private readonly itemsPerPage = 10;

  readonly capturedTabPage$ = new BehaviorSubject<number>(0);

  readonly collectedTabPage$ = new BehaviorSubject<number>(0);

  readonly collectedTabItems$ = combineLatest([
    this.postCaptures$,
    this.collectedTabPage$,
  ]).pipe(
    map(([items, page]) =>
      items.slice(0, page * this.itemsPerPage + this.itemsPerPage)
    )
  );

  readonly validatedTabItems$ = combineLatest([
    this.captures$,
    this.capturedTabPage$,
  ]).pipe(
    map(([items, page]) =>
      items.slice(0, page * this.itemsPerPage + this.itemsPerPage)
    )
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendAssetRefreshingService: DiaBackendAsseRefreshingService,
    private readonly alertController: AlertController,
    private readonly networkService: NetworkService,
    private readonly translocoService: TranslocoService,
    private readonly errorService: ErrorService,
    private readonly blockingActionService: BlockingActionService
  ) {}

  loadMoreItems(event: any) {
    switch (this.categories) {
      case 'validated':
        this.capturedTabPage$.next(this.capturedTabPage$.value + 1);
        break;
      case 'collected':
        this.collectedTabPage$.next(this.collectedTabPage$.value + 1);
        break;
    }

    const eventTarget = event.target as HTMLIonInfiniteScrollElement;
    eventTarget.complete();
  }

  async editUsername() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('editUsername'),
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: await this.diaBackendAuthService.getUsername(),
        },
      ],
      buttons: [
        {
          text: this.translocoService.translate('cancel'),
          role: 'cancel',
        },
        {
          text: this.translocoService.translate('ok'),
          handler: value => this.updateUsername(value.username),
        },
      ],
    });
    return alert.present();
  }

  private updateUsername(username: string) {
    const action$ = this.diaBackendAuthService
      .updateUser$({ username })
      .pipe(catchError((err: unknown) => this.handleUpdateUsernameError$(err)));
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private handleUpdateUsernameError$(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      const errorType = err.error.error?.type;
      if (errorType === 'duplicate_username') {
        return this.errorService.toastError$(
          this.translocoService.translate(`error.diaBackend.${errorType}`)
        );
      }
    }
    return this.errorService.toastError$(err);
  }

  // eslint-disable-next-line class-methods-use-this
  keyDescendingOrder(
    a: KeyValue<string, Proof[]>,
    b: KeyValue<string, Proof[]>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  trackCaptureGroupByDate(_: number, item: { key: string; value: Proof[] }) {
    return item.key;
  }

  // eslint-disable-next-line class-methods-use-this
  trackCaptureItem(_: number, item: Proof) {
    return getOldProof(item).hash;
  }

  // eslint-disable-next-line class-methods-use-this
  trackPostCapture(_: number, item: DiaBackendAsset) {
    return item.id;
  }

  refreshCaptures(event: Event) {
    this.diaBackendAssetRefreshingService
      .refresh()
      .pipe(
        finalize(() => {
          this.capturedTabPage$.next(0);
          this.collectedTabPage$.next(0);
          return (<CustomEvent>event).detail.complete();
        })
      )
      .subscribe();
  }
}
