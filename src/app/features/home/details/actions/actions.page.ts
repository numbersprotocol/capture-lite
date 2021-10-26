import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AlertInput } from '@ionic/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import {
  Action,
  ActionsService,
} from '../../../../shared/actions/actions.service';
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
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService,
    private readonly blockingActionService: BlockingActionService,
    private readonly route: ActivatedRoute,
    private readonly authService: DiaBackendAuthService
  ) {}

  openAction(action: Action) {
    return combineLatest([
      this.actionsService.getParams$(action.params_list_custom_param),
      this.authService.token$,
      this.id$,
    ])
      .pipe(
        concatMap(
          ([params, token, id]) =>
            new Promise<void>(resolve => {
              this.alertController
                .create({
                  header: action.title_text,
                  message: action.description_text,
                  inputs: params.map(
                    param =>
                      ({
                        name: param.name_text,
                        label: param.label_text,
                        type: param.type_text,
                        placeholder: param.placeholder_text,
                        value: param.default_value_text,
                      } as AlertInput)
                  ),
                  buttons: [
                    {
                      text: this.translocoService.translate('cancel'),
                      role: 'cancel',
                    },
                    {
                      text: this.translocoService.translate('ok'),
                      handler: value => {
                        const body = { ...value, token: token, cid: id };
                        return this.sendAction(action, body);
                      },
                    },
                  ],
                })
                .then(alert => {
                  alert.present();
                  resolve();
                });
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
      })
    );
    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
