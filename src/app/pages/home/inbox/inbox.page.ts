import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map, pluck, tap } from 'rxjs/operators';
import { BlockingActionService } from 'src/app/services/blocking-action/blocking-action.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { IgnoredTransactionRepository } from 'src/app/services/publisher/numbers-storage/repositories/ignored-transaction/ignored-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {

  postCaptures$ = this.listInbox();

  constructor(
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) { }

  private listInbox() {
    return this.numbersStorageApi.listInbox$().pipe(
      pluck('results'),
      concatMap(postCaptures => zip(of(postCaptures), this.ignoredTransactionRepository.getAll$())),
      map(([postCaptures, ignoredTransactions]) => postCaptures.filter(
        postcapture => !ignoredTransactions
          .map(transaction => transaction.id)
          .includes(postcapture.id)
      ))
    );
  }

  accept(id: string) {
    const action$ = this.numbersStorageApi.acceptTransaction$(id).pipe(
      tap(_ => this.refresh())
    );

    this.blockingActionService.run$(action$).pipe(
      untilDestroyed(this)
    ).subscribe();
  }

  ignore(id: string) {
    this.ignoredTransactionRepository.add$({ id }).pipe(
      tap(_ => this.refresh()),
      untilDestroyed(this)
    ).subscribe();
  }

  private refresh() {
    this.postCaptures$ = this.listInbox();
  }
}
