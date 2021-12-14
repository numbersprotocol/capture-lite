import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { ActionsDialogComponent } from '../../../../shared/actions/actions-dialog/actions-dialog.component';
import {
  Action,
  ActionsService,
} from '../../../../shared/actions/service/actions.service';
import { BlockingActionService } from '../../../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
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

  private readonly id$ = this.route.paramMap.pipe(
    map(params => params.get('id'))
  );

  constructor(
    private readonly actionsService: ActionsService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly blockingActionService: BlockingActionService,
    private readonly route: ActivatedRoute,
    private readonly authService: DiaBackendAuthService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  openAction(action: Action) {
    return combineLatest([
      this.actionsService.getParams$(action.params_list_custom_param1),
      this.authService.token$,
      this.id$,
    ])
      .pipe(
        concatMap(
          ([params, token, id]) =>
            new Promise<void>(resolve => {
              const dialogRef = this.dialog.open(ActionsDialogComponent, {
                disableClose: true,
                data: {
                  action: action,
                  params: params,
                },
              });
              dialogRef.afterClosed().subscribe(data => {
                if (data !== undefined) {
                  const body = { ...data, token: token, cid: id };
                  return this.sendAction(action, body);
                }
              });
              resolve();
            })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  sendAction(action: Action, body: any) {
    const action$ = this.actionsService.send$(action.base_url_text, body).pipe(
      catchError((err: unknown) => {
        return this.errorService.toastError$(err);
      }),
      tap(() =>
        this.snackBar.open(
          this.translocoService.translate('message.sentSuccessfully')
        )
      )
    );
    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
