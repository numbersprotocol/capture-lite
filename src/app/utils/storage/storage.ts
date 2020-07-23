import { Filesystem, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { BehaviorSubject, defer, forkJoin, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, mapTo, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { sha256$ } from '../crypto/crypto';

export class Storage<T extends object> {

  constructor(
    readonly name: string,
    readonly directory: FilesystemDirectory = FilesystemDirectory.Data
  ) { }

  private readonly tuples$ = new BehaviorSubject<T[]>([]);

  refresh$() {
    return this.makeNameDir$().pipe(
      switchMapTo(this.readNameDir$()),
      map(result => result.files),
      switchMap(fileNames => forkJoin(fileNames.map(fileName => this.readFile$(fileName))).pipe(defaultIfEmpty([]))),
      map(results => results.map(result => JSON.parse(result.data) as T)),
      tap(tuples => this.tuples$.next(tuples))
    );
  }

  private makeNameDir$(): Observable<void> {
    return defer(() => Filesystem.mkdir({
      path: this.name,
      directory: this.directory,
      recursive: true
    })).pipe(
      mapTo(void 0),
      catchError((err: Error) => {
        console.log(`${err.message} (${this.directory}/${this.name})`);
        return of(void 0);
      })
    );
  }

  private readNameDir$() {
    return defer(() => Filesystem.readdir({
      path: this.name,
      directory: this.directory
    }));
  }

  private readFile$(fileName: string) {
    return defer(() => Filesystem.readFile({
      path: `${this.name}/${fileName}`,
      directory: this.directory,
      encoding: FilesystemEncoding.UTF8
    }));
  }

  getAll$() { return this.tuples$.asObservable(); }

  add$(...tuples: T[]) {
    return forkJoin(tuples.map(tuple => this.saveFile$(tuple))).pipe(
      switchMapTo(this.refresh$()),
      mapTo(tuples)
    );
  }

  private saveFile$(tuple: T) {
    return sha256$(tuple).pipe(
      switchMap(hash => Filesystem.writeFile({
        path: `${this.name}/${hash}.json`,
        data: JSON.stringify(tuple),
        directory: this.directory,
        encoding: FilesystemEncoding.UTF8
      })));
  }

  remove$(...tuples: T[]) {
    return forkJoin(tuples.map(tuple => this.deleteFile$(tuple))).pipe(
      switchMapTo(this.refresh$()),
      mapTo(tuples)
    );
  }

  private deleteFile$(tuple: T) {
    return sha256$(tuple).pipe(
      switchMap(hash => Filesystem.deleteFile({
        path: `${this.name}/${hash}.json`,
        directory: this.directory
      })));
  }
}
