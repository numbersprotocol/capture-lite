import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, map, pluck, tap } from 'rxjs/operators';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
import { IgnoredTransactionRepository } from 'src/app/services/publisher/numbers-storage/data/ignored-transaction/ignored-transaction-repository.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

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
    private readonly assetRepository: AssetRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository
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
    this.numbersStorageApi.acceptTransaction$(id).pipe(
      concatMap(asset => this.assetRepository.addFromNumbersStorage$(asset)),
      tap(_ => this.refresh()),
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
