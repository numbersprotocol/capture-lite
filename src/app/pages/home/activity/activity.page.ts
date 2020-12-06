import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, pluck } from 'rxjs/operators';
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
      map(activities =>
        activities.map(activity => ({
          ...activity,
          status: this.getStatus(activity),
        }))
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
      return Status.InProgress;
    }
    if (activity.sender === email) {
      return Status.Delivered;
    }
    return Status.Accepted;
  }
}

enum Status {
  InProgress = 'inProgress',
  Returned = 'returned',
  Delivered = 'delivered',
  Accepted = 'accepted',
}
