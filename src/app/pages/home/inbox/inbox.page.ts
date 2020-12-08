import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map, pluck, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../services/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../../services/dia-backend/transaction/ignored-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {
  postCaptures$ = this.listInbox$();

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  private listInbox$() {
    return this.diaBackendTransactionRepository.getAll$().pipe(
      pluck('results'),
      concatMap(postCaptures =>
        zip(of(postCaptures), this.diaBackendAuthService.getEmail())
      ),
      map(([postCaptures, email]) =>
        postCaptures.filter(
          postCapture =>
            postCapture.receiver_email === email &&
            !postCapture.fulfilled_at &&
            !postCapture.expired
        )
      ),
      concatMap(postCaptures =>
        zip(of(postCaptures), this.ignoredTransactionRepository.getAll$())
      ),
      map(([postCaptures, ignoredTransactions]) =>
        postCaptures.filter(
          postcapture => !ignoredTransactions.includes(postcapture.id)
        )
      )
    );
  }

  accept(id: string) {
    const action$ = this.diaBackendTransactionRepository
      .accept$(id)
      .pipe(tap(_ => this.refresh()));

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async ignore(id: string) {
    await this.ignoredTransactionRepository.add(id);
    this.refresh();
  }

  private refresh() {
    this.postCaptures$ = this.listInbox$();
  }
}
