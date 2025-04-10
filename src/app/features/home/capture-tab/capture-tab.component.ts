import { formatDate, KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ActionSheetButton, ActionSheetController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, defer, iif } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import {
  CaptureTabSegments,
  CaptureTabService,
} from '../../../shared/capture-tab/capture-tab.service';
import { ConfirmAlert } from '../../../shared/confirm-alert/confirm-alert.service';
import { Database } from '../../../shared/database/database.service';
import { DiaBackendAssetUploadingService } from '../../../shared/dia-backend/asset/uploading/dia-backend-asset-uploading.service';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../shared/error/error.service';
import { MediaStore } from '../../../shared/media/media-store/media-store.service';
import { NetworkService } from '../../../shared/network/network.service';
import { PreferenceManager } from '../../../shared/preference-manager/preference-manager.service';
import { getOldProof } from '../../../shared/repositories/proof/old-proof-adapter';
import { Proof } from '../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../shared/repositories/proof/proof-repository.service';
import { ShareService } from '../../../shared/share/share.service';
import { browserToolbarColor } from '../../../utils/constants';
import { reloadApp } from '../../../utils/miscellaneous';
import { getFaqUrl, getShowcaseUrl } from '../../../utils/url';
import { PrefetchingDialogComponent } from '../onboarding/prefetching-dialog/prefetching-dialog.component';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-capture-tab',
  templateUrl: './capture-tab.component.html',
  styleUrls: ['./capture-tab.component.scss'],
})
export class CaptureTabComponent implements OnInit {
  /**
   * Enum values for the capture tab segments.
   * Used in the HTML template to avoid hardcoded string values.
   */
  readonly captureTabSegments = CaptureTabSegments;
  segment: CaptureTabSegments = CaptureTabSegments.VERIFIED;

  readonly hasNewInbox$ = this.diaBackendTransactionRepository.inbox$.pipe(
    catchError((err: unknown) => this.errorService.toastError$(err)),
    map(transactions => transactions.count !== 0),
    /**
     * WORKARDOUND: force changeDetection to update badge when returning to App
     * by clicking push notification
     */
    tap(() => this.changeDetectorRef.detectChanges()),
    startWith(false)
  );

  readonly username$ = this.diaBackendAuthService.username$;

  readonly email$ = this.diaBackendAuthService.email$;

  readonly profileName$ = this.diaBackendAuthService.profileName$;

  readonly profileDescription$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.description)
  );

  readonly profileBackground$ = this.diaBackendAuthService.profile$.pipe(
    map(profile => profile.profile_background_thumbnail ?? '')
  );

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
    map(proofs =>
      proofs.sort((a, b) => b.uploadedAtOrTimestamp - a.uploadedAtOrTimestamp)
    )
  );

  readonly networkConnected$ = this.networkService.connected$;

  private readonly itemsPerPage = 10;

  readonly capturedTabPageIndex$ = new BehaviorSubject<number>(0);

  readonly draftTabPageIndex$ = new BehaviorSubject<number>(0);

  readonly validatedCaptures$ = this.captures$.pipe(
    map(proofs => proofs.filter(p => p.diaBackendAssetId !== undefined))
  );

  readonly validatedTabItems$ = combineLatest([
    this.validatedCaptures$,
    this.capturedTabPageIndex$,
  ]).pipe(
    map(([items, page]) =>
      items.slice(0, page * this.itemsPerPage + this.itemsPerPage)
    )
  );

  readonly draftCaptures$ = this.captures$.pipe(
    map(proofs => proofs.filter(p => p.diaBackendAssetId === undefined))
  );

  readonly draftTabItems$ = combineLatest([
    this.draftCaptures$,
    this.draftTabPageIndex$,
  ]).pipe(
    map(([items, page]) =>
      items.slice(0, page * this.itemsPerPage + this.itemsPerPage)
    )
  );

  private pendingUploadTasks = 0;

  constructor(
    private readonly actionSheetController: ActionSheetController,
    private readonly router: Router,
    private readonly mediaStore: MediaStore,
    private readonly database: Database,
    private readonly confirmAlert: ConfirmAlert,
    private readonly dialog: MatDialog,
    private readonly preferenceManager: PreferenceManager,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly networkService: NetworkService,
    private readonly translocoService: TranslocoService,
    private readonly errorService: ErrorService,
    private readonly blockingActionService: BlockingActionService,
    private readonly captureTabService: CaptureTabService,
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {
    this.uploadService.pendingTasks$
      .pipe(untilDestroyed(this))
      .subscribe(value => (this.pendingUploadTasks = value));
    this.diaBackendAuthService
      .syncUser$()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  static async openFaq() {
    await Browser.open({ url: getFaqUrl(), toolbarColor: browserToolbarColor });
  }

  ngOnInit(): void {
    this.initSegmentListener();
  }

  private initSegmentListener() {
    this.captureTabService.segment$
      .pipe(
        tap(segment => (this.segment = segment)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  loadMoreItems(event: any) {
    switch (this.segment) {
      case CaptureTabSegments.VERIFIED:
        this.capturedTabPageIndex$.next(this.capturedTabPageIndex$.value + 1);
        break;
      case CaptureTabSegments.DRAFT:
        this.draftTabPageIndex$.next(this.draftTabPageIndex$.value + 1);
    }

    const eventTarget = event.target as HTMLIonInfiniteScrollElement;
    eventTarget.complete();
  }

  openMenu() {
    const buttons: ActionSheetButton[] = [
      {
        text: this.translocoService.translate('wallets.wallets'),
        handler: () => this.router.navigate(['wallets']),
      },
      {
        text: this.translocoService.translate('invitation.inviteFriends'),
        handler: () => this.router.navigate(['invitation']),
      },
      {
        text: this.translocoService.translate('settings.settings'),
        handler: () => this.router.navigate(['settings']),
      },
      {
        text: this.translocoService.translate('friends'),
        handler: () => this.router.navigate(['contacts']),
      },
      {
        text: this.translocoService.translate('dataPolicy'),
        handler: () => this.router.navigate(['data-policy']),
      },
      {
        text: this.translocoService.translate('termsOfUse'),
        handler: () => this.router.navigate(['terms-of-use']),
      },
      {
        text: this.translocoService.translate('faq'),
        handler: async () => await CaptureTabComponent.openFaq(),
      },
      {
        text: this.translocoService.translate('logout'),
        handler: () => this.logout(),
        cssClass: 'capture-tab-menu-logout-button',
      },
    ];

    this.actionSheetController
      .create({ buttons })
      .then(sheet => sheet.present());
  }

  shareShowcaseLink() {
    defer(() => this.username$)
      .pipe(
        switchMap(username =>
          ShareService.shareShowcasePage(getShowcaseUrl(username))
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  logout() {
    const action$ = defer(() => this.mediaStore.clear()).pipe(
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );
    defer(() =>
      this.confirmAlert.present({
        message: this.translocoService.translate('message.confirmLogout'),
      })
    )
      .pipe(
        concatMap(result =>
          iif(() => result, this.blockingActionService.run$(action$))
        ),
        untilDestroyed(this)
      )
      .subscribe();
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

  async refreshCaptures(event: Event) {
    (<CustomEvent>event).detail.complete();

    // Don't refresh if there are still captures being uploaded.
    if (this.pendingUploadTasks > 0) return;

    const confirmRefresh = await this.showRefreshAlert();
    if (confirmRefresh) {
      this.capturedTabPageIndex$.next(0);
      this.draftTabPageIndex$.next(0);

      return this.dialog.open(PrefetchingDialogComponent, {
        disableClose: true,
      });
    }
  }

  private async showRefreshAlert() {
    return this.confirmAlert.present({
      header: this.translocoService.translate('syncAndRestore'),
      message: this.translocoService.translate('message.confirmSyncAndRestore'),
      confirmButtonText: this.translocoService.translate(
        'confirmSyncAndRestore'
      ),
      cancelButtonText: this.translocoService.translate('cancelSyncAndRestore'),
    });
  }
}
