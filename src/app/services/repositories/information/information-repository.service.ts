import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { ProofOld } from '../proof/old-proof';
import { Information } from './information';

@Injectable({
  providedIn: 'root'
})
export class InformationRepository {

  private readonly id = 'information';
  private readonly table = this.database.getTable<Information>(this.id);

  constructor(
    private readonly database: Database
  ) { }

  getByProof$(proof: ProofOld) {
    return this.table.queryAll$().pipe(
      map(informationList => informationList.filter(info => info.proofHash === proof.hash))
    );
  }

  add$(...information: Information[]) { return defer(() => this.table.insert(information)); }

  removeByProof$(proof: ProofOld) {
    return this.getByProof$(proof).pipe(
      first(),
      switchMap(informationList => this.remove$(...informationList))
    );
  }

  remove$(...information: Information[]) {
    return defer(() => this.table.delete(information));
  }
}
