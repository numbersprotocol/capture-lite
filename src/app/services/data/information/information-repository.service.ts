import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { Storage } from 'src/app/utils/storage/storage';
import { Proof } from '../proof/proof';
import { Information } from './information';

@Injectable({
  providedIn: 'root'
})
export class InformationRepository {

  private readonly informationStorage = new Storage<Information>('information');

  refresh$() { return this.informationStorage.refresh$(); }

  getByProof$(proof: Proof) {
    return this.informationStorage.getAll$().pipe(
      map(informationList => informationList.filter(info => info.proofHash === proof.hash))
    );
  }

  add$(...information: Information[]) { return this.informationStorage.add$(...information); }

  removeByProof$(proof: Proof) {
    return this.getByProof$(proof).pipe(
      switchMap(informationList => this.remove$(...informationList))
    );
  }

  remove$(...information: Information[]) {
    return this.informationStorage.remove$(...information);
  }
}
