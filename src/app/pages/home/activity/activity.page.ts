import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { concatMap, pluck } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../services/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendTransaction,
  DiaBackendTransactionRepository,
} from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage {
  readonly status = Status;
  readonly activitiesWithStatus$ = this.diaBackendTransactionRepository
    .getAll$()
    .pipe(
      pluck('results'),
      concatMap(activities =>
        Promise.all(
          activities.map(async activity => ({
            ...activity,
            status: await this.getStatus(activity),
          }))
        )
      )
    );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository
  ) {}

  private async getStatus(activity: DiaBackendTransaction) {
    const email = await this.diaBackendAuthService.getEmail();
    if (activity.expired) {
      return Status.Returned;
    }
    if (!activity.fulfilled_at) {
      if (activity.receiver_email === email) {
        return Status.InProgress;
      }
      return Status.waitingToBeAccepted;
    }
    if (activity.sender === email) {
      return Status.Delivered;
    }
    return Status.Accepted;
  }
}

export enum Status {
  waitingToBeAccepted = 'waitingToBeAccepted',
  InProgress = 'inProgress',
  Returned = 'returned',
  Delivered = 'delivered',
  Accepted = 'accepted',
}
