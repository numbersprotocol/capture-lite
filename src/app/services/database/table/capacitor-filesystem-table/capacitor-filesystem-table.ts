import {
  FilesystemDirectory,
  FilesystemEncoding,
  FilesystemPlugin,
} from '@capacitor/core';
import { Mutex } from 'async-mutex';
import { differenceWith, intersectionWith, isEqual, uniqWith } from 'lodash';
import { BehaviorSubject, defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { OnConflictStrategy, Table, Tuple } from '../table';

export class CapacitorFilesystemTable<T extends Tuple> implements Table<T> {
  private readonly directory = FilesystemDirectory.Data;
  private readonly rootDir = CapacitorFilesystemTable.name;
  private readonly tuples$ = new BehaviorSubject<T[]>([]);
  private hasInitialized = false;
  private readonly mutex = new Mutex();

  constructor(
    readonly id: string,
    private readonly filesystemPlugin: FilesystemPlugin
  ) {}

  queryAll$() {
    return defer(() => this.initialize()).pipe(
      concatMapTo(this.tuples$.asObservable())
    );
  }

  async queryAll() {
    await this.initialize();
    return this.tuples$.value;
  }

  private async initialize() {
    return CapacitorFilesystemTable.initializationMutex.runExclusive(
      async () => {
        if (this.hasInitialized) {
          return;
        }
        if (!(await this.hasCreatedJson())) {
          await this.createEmptyJson();
        }
        await this.loadJson();
        this.hasInitialized = true;
      }
    );
  }

  private async hasCreatedJson() {
    const dirs = await this.filesystemPlugin.readdir({
      directory: this.directory,
      path: '',
    });
    if (!dirs.files.includes(this.rootDir)) {
      await this.filesystemPlugin.mkdir({
        directory: this.directory,
        path: this.rootDir,
        recursive: true,
      });
    }
    const files = await this.filesystemPlugin.readdir({
      directory: this.directory,
      path: this.rootDir,
    });
    return files.files.includes(`${this.id}.json`);
  }

  private async createEmptyJson() {
    return this.filesystemPlugin.writeFile({
      directory: this.directory,
      path: `${this.rootDir}/${this.id}.json`,
      data: JSON.stringify([]),
      encoding: FilesystemEncoding.UTF8,
      recursive: true,
    });
  }

  private async loadJson() {
    const result = await this.filesystemPlugin.readFile({
      directory: this.directory,
      path: `${this.rootDir}/${this.id}.json`,
      encoding: FilesystemEncoding.UTF8,
    });
    this.tuples$.next(JSON.parse(result.data));
  }

  async insert(
    tuples: T[],
    onConflict = OnConflictStrategy.ABORT,
    comparator = isEqual
  ) {
    return this.mutex.runExclusive(async () => {
      assertNoDuplicatedTuples(tuples, comparator);
      await this.initialize();
      if (onConflict === OnConflictStrategy.ABORT) {
        this.assertNoConflictWithExistedTuples(tuples, comparator);
        this.tuples$.next([...this.tuples$.value, ...tuples]);
      } else if (onConflict === OnConflictStrategy.IGNORE) {
        this.tuples$.next(
          uniqWith([...this.tuples$.value, ...tuples], comparator)
        );
      }
      await this.dumpJson();
      return tuples;
    });
  }

  private assertNoConflictWithExistedTuples(
    tuples: T[],
    comparator: (x: T, y: T) => boolean
  ) {
    const conflicted = intersectionWith(tuples, this.tuples$.value, comparator);
    if (conflicted.length !== 0) {
      throw new Error(`Tuples existed: ${JSON.stringify(conflicted)}`);
    }
  }

  async delete(tuples: T[]) {
    return this.mutex.runExclusive(async () => {
      this.assertTuplesExist(tuples);
      await this.initialize();
      const afterDeletion = this.tuples$.value.filter(
        tuple => !tuples.map(t => isEqual(tuple, t)).includes(true)
      );
      this.tuples$.next(afterDeletion);
      await this.dumpJson();
      return tuples;
    });
  }

  private assertTuplesExist(tuples: T[]) {
    const nonexistent = tuples.filter(
      tuple => !this.tuples$.value.find(t => isEqual(tuple, t))
    );
    if (nonexistent.length !== 0) {
      throw new Error(
        `Cannot delete nonexistent tuples: ${JSON.stringify(nonexistent)}`
      );
    }
  }

  private async dumpJson() {
    return this.filesystemPlugin.writeFile({
      directory: this.directory,
      path: `${this.rootDir}/${this.id}.json`,
      data: JSON.stringify(this.tuples$.value),
      encoding: FilesystemEncoding.UTF8,
      recursive: true,
    });
  }

  async drop() {
    this.hasInitialized = false;
    if (await this.hasCreatedJson()) {
      await this.filesystemPlugin.deleteFile({
        directory: this.directory,
        path: `${this.rootDir}/${this.id}.json`,
      });
    }
    return this.tuples$.complete();
  }

  private static readonly initializationMutex = new Mutex();
}

function assertNoDuplicatedTuples<T>(
  tuples: T[],
  comparator: (x: T, y: T) => boolean
) {
  const unique = uniqWith(tuples, comparator);
  if (tuples.length !== unique.length) {
    const conflicted = differenceWith(tuples, unique, comparator);
    throw new Error(`Tuples duplicated: ${JSON.stringify(conflicted)}`);
  }
}
