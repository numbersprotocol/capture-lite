import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError } from 'rxjs/operators';
import {
  Action,
  ActionsService,
} from '../../../../shared/actions/service/actions.service';
import { ErrorService } from '../../../../shared/error/error.service';

@UntilDestroy()
@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage {
  readonly actions$ = this.actionsService
    .getActions$()
    .pipe(catchError((err: unknown) => this.errorService.toastError$(err)));

  constructor(
    private readonly router: Router,
    private readonly actionsService: ActionsService,
    private readonly errorService: ErrorService,
    private readonly route: ActivatedRoute
  ) {}

  performAction(action: Action) {
    this.router.navigate(['action-details'], {
      relativeTo: this.route,
      state: action,
    });
  }
}
