import { Injectable } from '@angular/core';
import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { defer, zip } from 'rxjs';
import { concatMap, map, pluck, switchMap, switchMapTo } from 'rxjs/operators';
import { sha256WithBase64$ } from 'src/app/utils/crypto/crypto';
import { blobToDataUrlWithBase64$, dataUrlWithBase64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { getExtension, MimeType } from 'src/app/utils/mime-type';
import { forkJoinWithDefault, isNonNullable } from 'src/app/utils/rx-operators';
import { Database } from '../../database/database.service';
import { CaptionRepository } from '../caption/caption-repository.service';
import { InformationRepository } from '../information/information-repository.service';
import { SignatureRepository } from '../signature/signature-repository.service';
import { Proof } from './proof';

const { Filesystem } = Plugins;
// @ts-ignore
const ImageBlobReduce = require('image-blob-reduce')();

@Injectable({
  providedIn: 'root'
})
export class ProofRepository {

  private readonly id = 'proof';
  private readonly table = this.database.getTable<Proof>(this.id);
  private readonly rawFileDir = FilesystemDirectory.Data;
  private readonly rawFileFolderName = 'raw';
  private readonly thumbnailFileDir = FilesystemDirectory.Data;
  private readonly thumbnailFileFolderName = 'thumb';
  private readonly thumbnailSize = 200;

  constructor(
    private readonly database: Database,
    private readonly captionRepository: CaptionRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }

  getAll$() { return this.table.queryAll$(); }

  getByHash$(hash: string) {
    return this.getAll$().pipe(
      map(proofList => proofList.find(proof => proof.hash === hash))
    );
  }

  add$(...proofs: Proof[]) { return defer(() => this.table.insert(proofs)); }

  remove$(...proofs: Proof[]) {
    return defer(() => this.table.delete(proofs)).pipe(
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.deleteRawFile$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.deleteThumbnail$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.captionRepository.removeByProof$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.informationRepository.removeByProof$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.signatureRepository.removeByProof$(proof))))
    );
  }

  removeByHash$(hash: string) {
    return this.getByHash$(hash).pipe(
      isNonNullable(),
      concatMap(proof => this.remove$(proof))
    );
  }

  getRawFile$(proof: Proof) {
    return defer(() => Filesystem.readFile({
      path: `${this.rawFileFolderName}/${proof.hash}.${getExtension(proof.mimeType)}`,
      directory: this.rawFileDir
    })).pipe(pluck('data'));
  }

  /**
   * Copy [rawBase64] to add raw file to internal storage.
   * @param rawBase64 The original source of raw file which will be copied.
   * @param mimeType The file added in the internal storage. The name of the returned file will be its hash with original extension.
   */
  saveRawFile$(rawBase64: string, mimeType: MimeType) {
    return zip(
      this._saveRawFile$(rawBase64, mimeType),
      this.generateAndSaveThumbnailFile$(rawBase64, mimeType)
    ).pipe(
      map(([rawUri, _]) => rawUri)
    );
  }

  private _saveRawFile$(rawBase64: string, mimeType: MimeType) {
    return sha256WithBase64$(rawBase64).pipe(
      switchMap(hash => Filesystem.writeFile({
        path: `${this.rawFileFolderName}/${hash}.${getExtension(mimeType)}`,
        data: rawBase64,
        directory: this.rawFileDir,
        recursive: true
      })),
      pluck('uri')
    );
  }

  private deleteRawFile$(proof: Proof) {
    return defer(() => Filesystem.deleteFile({
      path: `${this.rawFileFolderName}/${proof.hash}.${getExtension(proof.mimeType)}`,
      directory: this.rawFileDir
    }));
  }

  getThumbnail$(proof: Proof) {
    return defer(() => Filesystem.readFile({
      path: `${this.thumbnailFileFolderName}/${proof.hash}.${getExtension(proof.mimeType)}`,
      directory: this.thumbnailFileDir
    })).pipe(pluck('data'));
  }

  private generateAndSaveThumbnailFile$(rawBase64: string, mimeType: MimeType) {
    return dataUrlWithBase64ToBlob$(`data:${mimeType};base64,${rawBase64}`).pipe(
      switchMap(rawImageBlob => ImageBlobReduce.toBlob(rawImageBlob, { max: this.thumbnailSize })),
      switchMap(thumbnailBlob => zip(blobToDataUrlWithBase64$(thumbnailBlob as Blob), sha256WithBase64$(rawBase64))),
      switchMap(([thumbnailBase64, hash]) => Filesystem.writeFile({
        path: `${this.thumbnailFileFolderName}/${hash}.${getExtension(mimeType)}`,
        data: thumbnailBase64,
        directory: this.thumbnailFileDir,
        recursive: true
      })),
      pluck('uri')
    );
  }

  private deleteThumbnail$(proof: Proof) {
    return defer(() => Filesystem.deleteFile({
      path: `${this.thumbnailFileFolderName}/${proof.hash}.${getExtension(proof.mimeType)}`,
      directory: this.thumbnailFileDir
    }));
  }
}
