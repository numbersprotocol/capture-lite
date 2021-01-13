import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { getOldProof } from '../../../../shared/services/repositories/proof/old-proof-adapter';
import { Proof } from '../../../../shared/services/repositories/proof/proof';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-capture-item',
  templateUrl: './capture-item.component.html',
  styleUrls: ['./capture-item.component.scss'],
})
export class CaptureItemComponent {
  // Use setter to make sure the item is updated even if the component is
  // recycled and redrawed (e.g. virtual scroll).
  @Input()
  set item(value: CaptureItem) {
    this._item$.next(value);
  }

  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly _item$ = new BehaviorSubject<CaptureItem | undefined>(
    undefined
  );
  readonly item$ = this._item$.asObservable().pipe(isNonNullable());
  readonly thumbnailUrl$ = this.item$.pipe(
    switchMap(item => item.getThumbnailUrl())
  );
  readonly willCollectTruth$ = this.item$.pipe(
    map(item => item.proof?.willCollectTruth === true)
  );
}

export class CaptureItem {
  proof?: Proof;
  private readonly createdTimestamp: number;

  get oldProofHash() {
    if (this.proof) {
      return getOldProof(this.proof).hash;
    }
  }

  get timestamp() {
    if (this.proof) {
      return this.proof.timestamp;
    }
    return this.createdTimestamp;
  }

  constructor({ proof }: { proof?: Proof }) {
    this.proof = proof;
    this.createdTimestamp = Date.now();
  }

  async getThumbnailUrl() {
    if (this.proof) {
      return this.proof.getThumbnailUrl();
    }
  }
}
