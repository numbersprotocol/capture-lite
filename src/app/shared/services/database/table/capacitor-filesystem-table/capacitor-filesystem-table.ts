import {
  FilesystemDirectory,
  FilesystemEncoding,
  FilesystemPlugin,
} from '@capacitor/core';
import { Mutex } from 'async-mutex';
import { differenceWith, intersectionWith, isEqual, uniqWith } from 'lodash';
import { BehaviorSubject, defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { isNonNullable } from '../../../../../utils/rx-operators/rx-operators';
import { OnConflictStrategy, Table, Tuple } from '../table';

export class CapacitorFilesystemTable<T extends Tuple> implements Table<T> {
  private readonly directory = FilesystemDirectory.Data;
  private readonly rootDir = CapacitorFilesystemTable.name;
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly tuples$ = new BehaviorSubject<T[] | undefined>(undefined);
  readonly queryAll$ = defer(() => this.initialize()).pipe(
    concatMapTo(this.tuples$.asObservable()),
    isNonNullable()
  );
  private hasInitialized = false;
  private readonly mutex = new Mutex();

  constructor(
    readonly id: string,
    private readonly filesystemPlugin: FilesystemPlugin
  ) {}

  async queryAll() {
    await this.initialize();
    if (this.tuples$.value) {
      return this.tuples$.value;
    }
    throw new Error(`${this.id} has not initialized.`);
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
        this.tuples$.next([...(this.tuples$.value ?? []), ...tuples]);
      } else if (onConflict === OnConflictStrategy.IGNORE) {
        this.tuples$.next(
          uniqWith([...(this.tuples$.value ?? []), ...tuples], comparator)
        );
      } else if (onConflict === OnConflictStrategy.REPLACE) {
        this.tuples$.next(
          uniqWith([...tuples, ...(this.tuples$.value ?? [])], comparator)
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
    const conflicted = intersectionWith(
      tuples,
      this.tuples$.value ?? [],
      comparator
    );
    if (conflicted.length !== 0) {
      throw new Error(`Tuples existed: ${JSON.stringify(conflicted)}`);
    }
  }

  async delete(tuples: T[], comparator = isEqual) {
    return this.mutex.runExclusive(async () => {
      this.assertTuplesExist(tuples, comparator);
      await this.initialize();
      const afterDeletion = differenceWith(
        this.tuples$.value,
        tuples,
        comparator
      );
      this.tuples$.next(afterDeletion);
      await this.dumpJson();
      return tuples;
    });
  }

  async update(tuples: T[], comparator: (x: T, y: T) => boolean) {
    return this.mutex.runExclusive(async () => {
      const afterDeletion = differenceWith(
        this.tuples$.value,
        tuples,
        comparator
      );
      this.tuples$.next(afterDeletion.concat(tuples));
      await this.dumpJson();
      return tuples;
    });
  }

  private assertTuplesExist(tuples: T[], comparator: (x: T, y: T) => boolean) {
    const nonexistent = differenceWith(
      tuples,
      this.tuples$.value ?? [],
      comparator
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

  async clear() {
    await this.destroy();
    return this.tuples$.next([]);
  }

  async drop() {
    await this.destroy();
    return this.tuples$.complete();
  }

  private async destroy() {
    return this.mutex.runExclusive(async () => {
      this.hasInitialized = false;
      if (await this.hasCreatedJson()) {
        await this.filesystemPlugin.deleteFile({
          directory: this.directory,
          path: `${this.rootDir}/${this.id}.json`,
        });
      }
    });
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
