import { Component } from '@angular/core';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';

@Component({
  selector: 'app-storage',
  templateUrl: 'storage.page.html',
  styleUrls: ['storage.page.scss'],
})
export class StoragePage {

  readonly proofList = this.proofRepository.getAll();

  constructor(
    private readonly proofRepository: ProofRepository
  ) { }
}
