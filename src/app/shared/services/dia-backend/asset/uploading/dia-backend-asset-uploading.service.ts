import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  of,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  tap,
} from 'rxjs/operators';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';
import { NetworkService } from '../../../network/network.service';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import { getOldProof } from '../../../repositories/proof/old-proof-adapter';
import { Proof } from '../../../repositories/proof/proof';
import { ProofRepository } from '../../../repositories/proof/proof-repository.service';
import { DiaBackendAssetRepository } from '../dia-backend-asset-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetUploadingService {
  private readonly preferences = this.preferenceManager.getPreferences(
    DiaBackendAssetUploadingService.name
  );
  private readonly _taskQueue$ = new BehaviorSubject<Proof[]>([]);
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _pendingTasks$ = new BehaviorSubject<number | undefined>(
    undefined
  );
  readonly isPaused$ = this.preferences.getBoolean$(PrefKeys.IS_PAUSED);
  readonly networkConnected$ = this.networkService.connected$;
  private readonly executionSignal$ = combineLatest([
    this.isPaused$,
    this.networkConnected$,
  ]).pipe(
    map(([isPaused, networkConnected]) => !isPaused && networkConnected),
    distinctUntilChanged()
  );
  private readonly taskQueue$ = this._taskQueue$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly pendingTasks$ = this._pendingTasks$
    .asObservable()
    .pipe(isNonNullable(), distinctUntilChanged());

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly networkService: NetworkService,
    private readonly preferenceManager: PreferenceManager,
    private readonly proofRepository: ProofRepository
  ) {}

  initialize$() {
    return combineLatest([
      this.uploadTaskDispatcher$(),
      this.uploadTaskWorker$(),
    ]);
  }

  async pause() {
    return this.preferences.setBoolean(PrefKeys.IS_PAUSED, true);
  }

  async resume() {
    return this.preferences.setBoolean(PrefKeys.IS_PAUSED, false);
  }

  private uploadTaskDispatcher$() {
    const taskDebounceTime = 50;
    return combineLatest([
      this.proofRepository.getAll$().pipe(debounceTime(taskDebounceTime)),
      this.executionSignal$,
    ]).pipe(
      tap(([proofs, signal]) => {
        const tasks = proofs.filter(
          proof => !proof.diaBackendAssetId && proof.isCollected
        );
        this._pendingTasks$.next(tasks.length);
        this.updateTaskQueue(signal ? tasks : []);
      })
    );
  }

  private uploadTaskWorker$() {
    const runTasks$ = this.taskQueue$.pipe(
      filter(proofs => proofs.length > 0),
      concatMap(proofs =>
        from(proofs).pipe(
          concatMap(proof => this.uploadProof$(proof)),
          isNonNullable(),
          concatMap(proof =>
            this.proofRepository.update(
              proof,
              (x, y) => getOldProof(x).hash === getOldProof(y).hash
            )
          )
        )
      )
    );
    return this.executionSignal$.pipe(
      switchMap(signal => (signal ? runTasks$ : EMPTY))
    );
  }

  private updateTaskQueue(proofs: Proof[]) {
    this._taskQueue$.next(proofs);
  }

  private uploadProof$(proof: Proof) {
    const retryDelay = 500;
    const retryLimit = 3;
    return this.diaBackendAssetRepository.add$(proof).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.error?.error.type === 'duplicate_asset_not_allowed') {
          return this.diaBackendAssetRepository.fetchByProof$(proof);
        }
        return throwError(err);
      }),
      map(diaBackendAsset => {
        proof.diaBackendAssetId = diaBackendAsset.id;
        return proof;
      }),
      retryWhen(err$ =>
        err$.pipe(
          mergeMap((error, i) => {
            const retryAttempt = i + 1;
            if (retryAttempt > retryLimit) {
              return throwError(error);
            }
            return timer(retryDelay);
          })
        )
      ),
      catchError(_ => {
        this.preferences.setBoolean(PrefKeys.IS_PAUSED, true);
        return of(undefined);
      })
    );
  }
}

const enum PrefKeys {
  IS_PAUSED = 'IS_PAUSED',
}
