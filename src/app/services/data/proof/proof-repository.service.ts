import { Injectable } from '@angular/core';
import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { defer, zip } from 'rxjs';
import { map, pluck, switchMap, switchMapTo } from 'rxjs/operators';
import { sha256WithBase64$ } from 'src/app/utils/crypto/crypto';
import { base64ToBlob$, blobToBase64$ } from 'src/app/utils/encoding/encoding';
import { getExtension, MimeType } from 'src/app/utils/mime-type';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';
import { Storage } from 'src/app/utils/storage/storage';
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

  private readonly proofStorage = new Storage<Proof>('proof');
  private readonly rawFileDir = FilesystemDirectory.Data;
  private readonly rawFileFolderName = 'raw';
  private readonly thumbnailFileDir = FilesystemDirectory.Data;
  private readonly thumbnailFileFolderName = 'thumb';
  private readonly thumbnailSize = 200;

  constructor(
    private readonly captionRepository: CaptionRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository
  ) { }

  getAll$() { return this.proofStorage.getAll$(); }

  getByHash$(hash: string) {
    return this.getAll$().pipe(
      map(proofList => proofList.find(proof => proof.hash === hash))
    );
  }

  add$(...proofs: Proof[]) { return this.proofStorage.add$(...proofs); }

  remove$(...proofs: Proof[]) {
    return this.proofStorage.remove$(...proofs).pipe(
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.deleteRawFile$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.captionRepository.removeByProof$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.informationRepository.removeByProof$(proof)))),
      switchMapTo(forkJoinWithDefault(proofs.map(proof => this.signatureRepository.removeByProof$(proof))))
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
    return base64ToBlob$(`data:${mimeType};base64,${rawBase64}`).pipe(
      switchMap(rawImageBlob => ImageBlobReduce.toBlob(rawImageBlob, { max: this.thumbnailSize })),
      switchMap(thumbnailBlob => zip(blobToBase64$(thumbnailBlob as Blob), sha256WithBase64$(rawBase64))),
      switchMap(([thumbnailBase64, hash]) => Filesystem.writeFile({
        path: `${this.thumbnailFileFolderName}/${hash}.${getExtension(mimeType)}`,
        data: thumbnailBase64,
        directory: this.thumbnailFileDir,
        recursive: true
      })),
      pluck('uri')
    );
  }
}
