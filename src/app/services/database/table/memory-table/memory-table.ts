import { equals } from 'lodash/fp';
import { BehaviorSubject } from 'rxjs';
import { Table, Tuple } from '../table';

export class MemoryTable<T extends Tuple> implements Table<T> {
  private readonly tuples$ = new BehaviorSubject<T[]>([]);

  constructor(readonly id: string) {}

  queryAll$() {
    return this.tuples$.asObservable();
  }

  async insert(tuples: T[]) {
    assertNoDuplicatedTuples(tuples);
    this.assertNoConflictWithExistedTuples(tuples);
    this.tuples$.next([...this.tuples$.value, ...tuples]);
    return tuples;
  }

  private assertNoConflictWithExistedTuples(tuples: T[]) {
    const conflicted = intersaction(tuples, this.tuples$.value);
    if (conflicted.length !== 0) {
      throw new Error(`Tuples existed: ${conflicted}`);
    }
  }

  async delete(tuples: T[]) {
    this.assertTuplesExist(tuples);
    const afterDeletion = this.tuples$.value.filter(
      tuple => !tuples.map(t => equals(tuple)(t)).includes(true)
    );
    this.tuples$.next(afterDeletion);
    return tuples;
  }

  private assertTuplesExist(tuples: T[]) {
    const nonexistent = tuples.filter(
      tuple => !this.tuples$.value.find(t => equals(tuple)(t))
    );
    if (nonexistent.length !== 0) {
      throw new Error(`Cannot delete nonexistent tuples: ${nonexistent}`);
    }
  }

  async drop() {
    return this.tuples$.complete();
  }
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
