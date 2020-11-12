import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMap, pluck, tap } from 'rxjs/operators';
import { AssetRepository } from 'src/app/services/publisher/numbers-storage/data/asset/asset-repository.service';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {

  postCaptures$ = this.numbersStorageApi.listInbox$().pipe(pluck('results'));

  constructor(
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly assetRepository: AssetRepository
  ) { }

  accept(id: string) {
    this.numbersStorageApi.acceptTransaction$(id).pipe(
      concatMap(asset => this.assetRepository.addFromNumbersStorage$(asset)),
      tap(_ => this.refresh()),
      untilDestroyed(this)
    ).subscribe();
  }

  private refresh() {
    this.postCaptures$ = this.numbersStorageApi.listInbox$().pipe(pluck('results'));
  }
}
