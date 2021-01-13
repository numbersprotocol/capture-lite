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
import { DiaBackendAssetRepository } from '../dia-backend/asset/dia-backend-asset-repository.service';
import { getOldProof } from '../repositories/proof/old-proof-adapter';
import { Proof } from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly _isPaused$ = new BehaviorSubject(false);
  private readonly _isPausedByFailure$ = new BehaviorSubject(false);
  private readonly _taskQueue$ = new BehaviorSubject<Proof[]>([]);
  private readonly _currentUploadingCount$ = new BehaviorSubject(0);
  readonly isPaused$ = this._isPaused$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly isPausedByFailure$ = this._isPausedByFailure$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly currentUploadingCount$ = this._currentUploadingCount$
    .asObservable()
    .pipe(distinctUntilChanged());
  private readonly taskQueue$ = combineLatest([
    this._taskQueue$.asObservable().pipe(distinctUntilChanged()),
    this.isPaused$,
  ]).pipe(map(([t, _]) => t));

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository
  ) {}

  initialize$() {
    return combineLatest([
      this.uploadTaskDispatcher$(),
      this.uploadTaskWorker$(),
    ]);
  }

  pause() {
    this._isPaused$.next(true);
  }

  resume() {
    this._isPaused$.next(false);
  }

  private uploadTaskDispatcher$() {
    const taskDebounceTime = 50;
    return combineLatest([
      this.proofRepository.getAll$().pipe(debounceTime(taskDebounceTime)),
      this.isPaused$,
    ]).pipe(
      tap(([proofs, isPaused]) => {
        const tasks = proofs.filter(
          proof => !proof.diaBackendAssetId && !proof.willCollectTruth
        );
        this._currentUploadingCount$.next(tasks.length);
        this.updateTaskQueue(isPaused ? [] : tasks);
      })
    );
  }

  private uploadTaskWorker$() {
    const runTasks$ = this.taskQueue$.pipe(
      filter(proofs => proofs.length > 0),
      concatMap(proofs =>
        from(proofs).pipe(
          concatMap(proof => this.uploadProof$(proof)),
          concatMap(proof =>
            this.proofRepository.update(
              proof,
              (x, y) => getOldProof(x).hash === getOldProof(y).hash
            )
          )
        )
      )
    );
    return this.isPaused$.pipe(
      switchMap(isPaused => (isPaused ? EMPTY : runTasks$))
    );
  }

  private updateTaskQueue(proofs: Proof[]) {
    this._taskQueue$.next(proofs);
  }

  private uploadProof$(proof: Proof) {
    const retryDelay = 500;
    const retryLimit = 3;
    return this.diaBackendAssetRepository.createAsset$(proof).pipe(
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
        this._isPausedByFailure$.next(true);
        this._isPaused$.next(true);
        return of(proof);
      })
    );
  }
}
