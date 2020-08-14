import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { concatMap, concatMapTo, first, map, switchMap } from 'rxjs/operators';
import { Storage } from 'src/app/utils/storage/storage';
import { Proof } from '../proof/proof';
import { Caption } from './caption';

@Injectable({
  providedIn: 'root'
})
export class CaptionRepository {

  private readonly captionStorage = new Storage<Caption>('caption');

  refresh$() { return this.captionStorage.refresh$(); }

  getByProof$(proof: Proof) {
    return this.captionStorage.getAll$().pipe(
      map(captions => captions.filter(caption => caption.proofHash === proof.hash))
    );
  }

  addOrEdit$(value: Caption) {
    return this.captionStorage.getAll$().pipe(
      first(),
      map(captions => captions.find(caption => caption.proofHash === value.proofHash)),
      concatMap(found => {
        if (found) { return this.remove$(found); }
        return of(found);
      }),
      concatMapTo(this.captionStorage.add$(value))
    );
  }

  removeByProof$(proof: Proof) {
    return this.getByProof$(proof).pipe(
      first(),
      switchMap(captions => this.remove$(...captions))
    );
  }

  remove$(...captions: Caption[]) {
    return this.captionStorage.remove$(...captions);
  }
}
