import { Injectable } from '@angular/core';
import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Proof } from './proof';

const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  static readonly RAW_FILES_DIR = FilesystemDirectory.Data;
  static readonly RAW_FILES_DIR_NAME = 'raw';
  private readonly proofList: Set<Proof> = new Set();

  getAll() { return this.proofList; }

  add(...proofs: Proof[]) { proofs.forEach(proof => this.proofList.add(proof)); }

  remove(...proofs: Proof[]) { proofs.forEach(proof => this.proofList.delete(proof)); }

  getRawFile$(proof: Proof) {
    return defer(() => Filesystem.readFile({
      path: `${ProofRepository.RAW_FILES_DIR_NAME}/${proof.hash}.${proof.mimeType.extension}`,
      directory: ProofRepository.RAW_FILES_DIR
    })).pipe(
      map(result => result.data)
    );
  }

  removeRawFile$(proof: Proof) {
    return defer(() => Filesystem.deleteFile({
      path: `${ProofRepository.RAW_FILES_DIR_NAME}/${proof.hash}.${proof.mimeType.extension}`,
      directory: ProofRepository.RAW_FILES_DIR
    }));
  }
}
