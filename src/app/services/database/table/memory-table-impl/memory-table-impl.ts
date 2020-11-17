import _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { Table, Tuple } from '../table';

export class MemoryTableImpl<T extends Tuple> implements Table<T> {

  private readonly tuples$ = new BehaviorSubject<T[]>([]);

  constructor(
    readonly id: string
  ) { }

  queryAll$() { return this.tuples$.asObservable(); }

  async insert(tuples: T[]) {
    this.assertNoDuplicatedTuples(tuples);
    this.assertNoConflictWithExistedTuples(tuples);
    this.tuples$.next([...this.tuples$.value, ...tuples]);
    return tuples;
  }

  private assertNoDuplicatedTuples(tuples: T[]) {
    const conflicted: T[] = [];
    tuples.forEach((a, index) => {
      for (let bIndex = index + 1; bIndex < tuples.length; bIndex++) {
        if (_.isEqual(a, tuples[bIndex])) { conflicted.push(a); }
      }
    });
    if (conflicted.length !== 0) { throw new Error(`Tuples duplicated: ${conflicted}`); }
  }

  private assertNoConflictWithExistedTuples(tuples: T[]) {
    const conflicted = intersaction(tuples, this.tuples$.value);
    if (conflicted.length !== 0) { throw new Error(`Tuples existed: ${conflicted}`); }
  }

  async delete(tuples: T[]) {
    this.assertTuplesExist(tuples);
    const afterDeletion = this.tuples$.value.filter(
      tuple => !tuples
        // tslint:disable-next-line: rxjs-no-unsafe-scope
        .map(t => _.isEqual(tuple, t))
        .includes(true)
    );
    this.tuples$.next(afterDeletion);
    return tuples;
  }

  private assertTuplesExist(tuples: T[]) {
    // tslint:disable-next-line: rxjs-no-unsafe-scope
    const nonexistent = tuples.filter(tuple => !this.tuples$.value.find(t => _.isEqual(tuple, t)));
    if (nonexistent.length !== 0) { throw new Error(`Cannot delete nonexistent tuples: ${nonexistent}`); }
  }

  async drop() { return this.tuples$.complete(); }
}

function intersaction<T>(list1: T[], list2: T[]) {
  // tslint:disable-next-line: rxjs-no-unsafe-scope
  return list1.filter(tuple1 => list2.find(tuple2 => _.isEqual(tuple1, tuple2)));
}
