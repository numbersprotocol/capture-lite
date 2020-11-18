import { Injectable } from '@angular/core';
import { Proof } from './proof';

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  getAll$() {
    return;
  }

  async add(proof: Proof) {
    return proof;
  }

  async remove(proof: Proof) {
    return proof;
  }
}
