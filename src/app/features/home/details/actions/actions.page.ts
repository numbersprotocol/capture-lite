import { Component } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ActionsService } from '../../../../shared/actions/actions.service';
import { ErrorService } from '../../../../shared/error/error.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage {
  readonly actions$ = this.actionsService
    .actions$()
    .pipe(catchError((err: unknown) => this.errorService.toastError$(err)));

  constructor(
    private readonly actionsService: ActionsService,
    private readonly errorService: ErrorService
  ) {}
}
