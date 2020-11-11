import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { pluck, tap } from 'rxjs/operators';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage {

  readonly status = Status;
  readonly activities$ = this.numbersStorageApi.listTransactions$().pipe(
    pluck('results'),
    tap(v => console.log(v))
  );

  constructor(
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }
}

enum Status {
  Accepted = 'accepted',
  Returned = 'returned',
  Delivered = 'delivered'
}
