import { Injectable } from '@angular/core';
import { Filesystem, FilesystemDirectory } from '@capacitor/core';
import { defer, forkJoin } from 'rxjs';
import { filter, map, switchMap, switchMapTo } from 'rxjs/operators';
import { sha256WithBase64$ } from 'src/app/utils/crypto/crypto';
import { MimeType } from 'src/app/utils/mime-type';
import { Storage } from 'src/app/utils/storage/storage';
import { InformationRepository } from '../information/information-repository.service';
import { SignatureRepository } from '../signature/signature-repository.service';
import { Proof } from './proof';

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  private readonly proofStorage = new Storage<Proof>('proof');
  private readonly rawFileDir = FilesystemDirectory.Data;
  private readonly rawFileFolderName = 'raw';

  constructor(
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }

  refresh$() { return this.proofStorage.refresh$(); }

  getAll$() { return this.proofStorage.getAll$(); }

  getByHash$(hash: string) {
    return this.getAll$().pipe(
      map(proofList => proofList.find(proof => proof.hash === hash)),
      filter(proof => !!proof)
    );
  }

  add$(...proofs: Proof[]) { return this.proofStorage.add$(...proofs); }

  remove$(...proofs: Proof[]) {
    return this.proofStorage.remove$(...proofs).pipe(
      switchMapTo(forkJoin(proofs.map(proof => this.deleteRawFile$(proof)))),
      switchMapTo(forkJoin(proofs.map(proof => this.informationRepository.removeByProof$(proof)))),
      switchMapTo(forkJoin(proofs.map(proof => this.signatureRepository.removeByProof$(proof))))
    );
  }

  getRawFile$(proof: Proof) {
    return defer(() => Filesystem.readFile({
      path: `${this.rawFileFolderName}/${proof.hash}.${proof.mimeType.extension}`,
      directory: this.rawFileDir
    })).pipe(map(result => result.data));
  }

  /**
   * Copy [rawBase64] to add raw file to internal storage.
   * @param rawBase64 The original source of raw file which will be copied.
   * @param mimeType The file added in the internal storage. The name of the returned file will be its hash with original extension.
   */
  saveRawFile$(rawBase64: string, mimeType: MimeType) {
    return sha256WithBase64$(rawBase64).pipe(
      switchMap(hash => Filesystem.writeFile({
        path: `${this.rawFileFolderName}/${hash}.${mimeType.extension}`,
        data: rawBase64,
        directory: this.rawFileDir
      })),
      map(result => result.uri)
    );
  }

  private deleteRawFile$(proof: Proof) {
    return defer(() => Filesystem.deleteFile({
      path: `${this.rawFileFolderName}/${proof.hash}.${proof.mimeType.extension}`,
      directory: this.rawFileDir
    }));
  }
}
