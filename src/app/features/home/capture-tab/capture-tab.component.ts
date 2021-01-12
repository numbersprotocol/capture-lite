import { formatDate, KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { groupBy } from 'lodash';
import { concatMap, map } from 'rxjs/operators';
import { ProofRepository } from '../../../shared/services/repositories/proof/proof-repository.service';

@Component({
  selector: 'app-capture-tab',
  templateUrl: './capture-tab.component.html',
  styleUrls: ['./capture-tab.component.scss'],
})
export class CaptureTabComponent {
  private readonly proofs$ = this.proofRepository.getAll$();
  readonly capturesByDate$ = this.proofs$.pipe(
    map(proofs => proofs.sort((a, b) => b.timestamp - a.timestamp)),
    concatMap(proofs =>
      Promise.all(
        proofs.map(async proof => ({
          proof,
          thumbnailUrl: await proof.getThumbnailUrl(),
        }))
      )
    ),
    map(captures =>
      groupBy(captures, capture =>
        formatDate(capture.proof.timestamp, 'yyyy/MM/dd', 'en-US')
      )
    )
  );

  constructor(private readonly proofRepository: ProofRepository) {}

  // tslint:disable-next-line: prefer-function-over-method
  keyDescendingOrder(
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number {
    return a.key > b.key ? -1 : b.key > a.key ? 1 : 0;
  }
}
