import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  catchError,
  concatMapTo,
  first,
  pluck,
  shareReplay,
} from 'rxjs/operators';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import {
  DiaBackendContact,
  DiaBackendContactRepository,
} from '../../shared/dia-backend/contact/dia-backend-contact-repository.service';
import { ErrorService } from '../../shared/error/error.service';

@UntilDestroy()
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage {
  readonly contacts$ = this.diaBackendContactRepository.all$.pipe(
    pluck('results'),
    catchError((err: unknown) => this.errorService.toastError$(err)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly diaBackendContactRepository: DiaBackendContactRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService
  ) {}

  delete(contact: DiaBackendContact) {
    const action$ = this.diaBackendContactRepository
      .deleteByEmail$(contact.contact_email)
      .pipe(concatMapTo(this.diaBackendContactRepository.all$), first());
    return this.blockingActionService
      .run$(action$)
      .pipe(
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  trackContact(_: number, item: DiaBackendContact) {
    return item.contact_email;
  }
}
