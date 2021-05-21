import { Component } from '@angular/core';
import { defer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { InformationSessionService } from './session/information-session.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage {
  private readonly activatedDetailedCapture$ = defer(
    async () => this.sessionService.activatedDetailedCapture
  ).pipe(isNonNullable());

  readonly timestamp$ = this.activatedDetailedCapture$.pipe(
    switchMap(c => c.timestamp$)
  );

  readonly oldProofHash$ = this.activatedDetailedCapture$.pipe(
    map(c => c.hash)
  );

  readonly mimeType$ = this.activatedDetailedCapture$.pipe(
    switchMap(c => c.mediaMimeType$)
  );

  readonly facts$ = this.activatedDetailedCapture$.pipe(
    switchMap(c => c.facts$)
  );

  readonly signature$ = this.activatedDetailedCapture$.pipe(
    switchMap(c => c.signature$)
  );

  constructor(private readonly sessionService: InformationSessionService) {}
}
