import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMapTo, pluck, shareReplay } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import {
  DiaBackendContact,
  DiaBackendContactRepository,
} from '../../shared/services/dia-backend/contact/dia-backend-contact-repository.service';

@UntilDestroy()
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage {
  readonly contacts$ = this.diaBackendContactRepository.all$.pipe(
    pluck('results'),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly diaBackendContactRepository: DiaBackendContactRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  delete(contact: DiaBackendContact) {
    const action$ = this.diaBackendContactRepository
      .deleteByEmail$(contact.contact_email)
      .pipe(concatMapTo(this.diaBackendContactRepository.all$));
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  // tslint:disable-next-line: prefer-function-over-method
  trackContact(_: number, item: DiaBackendContact) {
    return item.contact_email;
  }
}
