import { FilesystemDirectory, FilesystemEncoding, Plugins } from '@capacitor/core';
import { BehaviorSubject, defer, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, mapTo, pluck, switchMap, switchMapTo, tap, toArray } from 'rxjs/operators';
import { sha256$ } from '../crypto/crypto';
import { forkJoinWithDefault } from '../rx-operators';

const { Filesystem } = Plugins;

export class Storage<T extends object> {

  constructor(
    readonly name: string,
    readonly directory: FilesystemDirectory = FilesystemDirectory.Data
  ) { }

  private readonly tuples$ = new BehaviorSubject<T[]>([]);

  refresh$() {
    return this.makeNameDir$().pipe(
      switchMapTo(this.readNameDir$()),
      pluck('files'),
      switchMap(fileNames => from(fileNames)),
      concatMap(fileName => this.readFile$(fileName)),
      map(result => JSON.parse(result.data) as T),
      toArray(),
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
        if (err.message === 'Current directory does already exist.') { return of(void 0); }
        throw err;
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
    return forkJoinWithDefault(tuples.map(tuple => this.saveFile$(tuple))).pipe(
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
        encoding: FilesystemEncoding.UTF8,
        recursive: true
      })));
  }

  remove$(...tuples: T[]) {
    return forkJoinWithDefault(tuples.map(tuple => this.deleteFile$(tuple))).pipe(
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
