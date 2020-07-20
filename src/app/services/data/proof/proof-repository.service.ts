import { Injectable } from '@angular/core';
import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { BehaviorSubject, defer, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { sha256$ } from 'src/app/utils/crypto/crypto';
import { MimeType } from 'src/app/utils/mime-type';
import { Proof } from './proof';

const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  private readonly rawFileDir = FilesystemDirectory.Data;
  private readonly rawFileDirName = 'raw';
  private readonly proofList$ = new BehaviorSubject(new Set<Proof>());

  getAll$() { return this.proofList$.asObservable(); }

  getByHash$(hash: string) {
    return this.proofList$.pipe(
      map(proofSet => [...proofSet].find(proof => proof.hash === hash))
    );
  }

  add(...proofs: Proof[]) {
    proofs.forEach(proof => this.proofList$.next(this.proofList$.value.add(proof)));
    return proofs;
  }

  remove(...proofs: Proof[]) {
    proofs.forEach(proof => {
      this.proofList$.value.delete(proof);
      this.proofList$.next(this.proofList$.value);
    });
    return proofs;
  }

  getRawFile$(proofOrHash: Proof | string) {
    return defer(() => {
      if (typeof proofOrHash === 'object') { return of(proofOrHash); }
      else { return this.getByHash$(proofOrHash); }
    }).pipe(
      switchMap(proof => from(Filesystem.readFile({
        path: `${this.rawFileDirName}/${proof.hash}.${proof.mimeType.extension}`,
        directory: this.rawFileDir
      }))),
      map(result => result.data)
    );
  }

  /**
   * Copy [rawBase64] to add raw file to internal storage.
   * @param rawBase64 The original source of raw file which will be copied.
   * @param mimeType The file added in the internal storage. The name of the returned file will be its hash with original extension.
   */
  addRawFile$(rawBase64: string, mimeType: MimeType) {
    return sha256$(rawBase64).pipe(
      switchMap(hash => Filesystem.writeFile({
        path: `${this.rawFileDirName}/${hash}.${mimeType.extension}`,
        data: rawBase64,
        directory: this.rawFileDir
      })),
      map(result => result.uri)
    );
  }

  removeRawFile$(proof: Proof) {
    return defer(() => Filesystem.deleteFile({
      path: `${this.rawFileDirName}/${proof.hash}.${proof.mimeType.extension}`,
      directory: this.rawFileDir
    }));
  }
}
