import {
  FilesystemDirectory,
  FilesystemEncoding,
  FilesystemPlugin,
} from '@capacitor/core';
import { Mutex } from 'async-mutex';
import { equals } from 'lodash/fp';
import { BehaviorSubject, defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { Table, Tuple } from '../table';

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

  async insert(tuples: T[]) {
    return this.mutex.runExclusive(async () => {
      assertNoDuplicatedTuples(tuples);
      this.assertNoConflictWithExistedTuples(tuples);
      await this.initialize();
      this.tuples$.next([...this.tuples$.value, ...tuples]);
      await this.dumpJson();
      return tuples;
    });
  }

  private assertNoConflictWithExistedTuples(tuples: T[]) {
    const conflicted = intersaction(tuples, this.tuples$.value);
    if (conflicted.length !== 0) {
      throw new Error(`Tuples existed: ${conflicted}`);
    }
  }

  async delete(tuples: T[]) {
    return this.mutex.runExclusive(async () => {
      this.assertTuplesExist(tuples);
      await this.initialize();
      const afterDeletion = this.tuples$.value.filter(
        tuple => !tuples.map(t => equals(tuple)(t)).includes(true)
      );
      this.tuples$.next(afterDeletion);
      await this.dumpJson();
      return tuples;
    });
  }

  private assertTuplesExist(tuples: T[]) {
    const nonexistent = tuples.filter(
      tuple => !this.tuples$.value.find(t => equals(tuple)(t))
    );
    if (nonexistent.length !== 0) {
      throw new Error(`Cannot delete nonexistent tuples: ${nonexistent}`);
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

function assertNoDuplicatedTuples<T>(tuples: T[]) {
  const conflicted: T[] = [];
  tuples.forEach((a, index) => {
    for (let bIndex = index + 1; bIndex < tuples.length; bIndex += 1) {
      if (equals(a)(tuples[bIndex])) {
        conflicted.push(a);
      }
    }
  });
  if (conflicted.length !== 0) {
    throw new Error(`Tuples duplicated: ${conflicted}`);
  }
}

function intersaction<T>(list1: T[], list2: T[]) {
  return list1.filter(tuple1 => list2.find(tuple2 => equals(tuple1)(tuple2)));
}
