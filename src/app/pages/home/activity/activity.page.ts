import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { of, zip } from 'rxjs';
import { concatMap, first, map, pluck } from 'rxjs/operators';
import {
  NumbersStorageApi,
  Transaction,
} from '../../../services/publisher/numbers-storage/numbers-storage-api.service';
import { forkJoinWithDefault } from '../../../utils/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage {
  readonly status = Status;
  readonly activitiesWithStatus$ = this.numbersStorageApi
    .listTransactions$()
    .pipe(
      pluck('results'),
      concatMap(activities =>
        zip(
          of(activities),
          forkJoinWithDefault(
            activities.map(activity => this.getStatus$(activity))
          )
        )
      ),
      map(([activities, statusList]) =>
        activities.map((activity, index) => ({
          ...activity,
          status: statusList[index],
        }))
      )
    );

  constructor(private readonly numbersStorageApi: NumbersStorageApi) {}

  private getStatus$(activity: Transaction) {
    return this.numbersStorageApi.getEmail$().pipe(
      map(email => {
        if (activity.expired) {
          return Status.Returned;
        }
        if (!activity.fulfilled_at) {
          return Status.InProgress;
        }
        if (activity.sender === email) {
          return Status.Delivered;
        }
        return Status.Accepted;
      }),
      first()
    );
  }
}

enum Status {
  InProgress = 'inProgress',
  Returned = 'returned',
  Delivered = 'delivered',
  Accepted = 'accepted',
}
