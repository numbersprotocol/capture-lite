/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Filesystem } from '@capacitor/filesystem';
import { defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { OnConflictStrategy, Table, Tuple } from '../table';
import { CapacitorFilesystemTable } from './capacitor-filesystem-table';

describe('CapacitorFilesystemTable', () => {
  let table: Table<TestTuple>;

  beforeEach(() => {
    const tableId = 'tableId';
    table = new CapacitorFilesystemTable(tableId, Filesystem);
  });

  afterEach(async () => table.drop());

  it('should be created', () => expect(table).toBeTruthy());

  it('should emit empty array with Observable on initial query', done => {
    table.queryAll$.subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should emit empty array with Promise on initial query', async () => {
    const tuples = await table.queryAll();
    expect(tuples).toEqual([]);
  });

  it('should emit new query on inserting tuple', done => {
    defer(async () => {
      await table.insert([TUPLE1]);
      await table.insert([TUPLE2]);
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual([TUPLE1, TUPLE2]);
        done();
      });
  });

  it('should throw on inserting same tuple', async () => {
    const sameTuple: TestTuple = { ...TUPLE1 };

    await expectAsync(table.insert([TUPLE1, sameTuple])).toBeRejected();
  });

  it('should throw on inserting same tuple with comparator', async () => {
    const sameIdTuple: TestTuple = { ...TUPLE2, id: TUPLE1_ID };

    await expectAsync(
      table.insert(
        [TUPLE1, sameIdTuple],
        OnConflictStrategy.ABORT,
        (x, y) => x.id === y.id
      )
    ).toBeRejected();
  });

  it('should throw on inserting existed tuple', async () => {
    const sameTuple: TestTuple = { ...TUPLE1 };
    await table.insert([TUPLE1]);

    await expectAsync(table.insert([sameTuple])).toBeRejected();
  });

  it('should throw on inserting existed tuple with comparator', async () => {
    const sameIdTuple: TestTuple = { ...TUPLE2, id: TUPLE1_ID };
    await table.insert([TUPLE1]);

    await expectAsync(
      table.insert(
        [sameIdTuple],
        OnConflictStrategy.ABORT,
        (x, y) => x.id === y.id
      )
    ).toBeRejected();
  });

  it('should ignore on inserting existed tuple if the conflict strategy is IGNORE', async () => {
    const sameTuple: TestTuple = { ...TUPLE1 };
    await table.insert([TUPLE1]);

    await table.insert([sameTuple, TUPLE2], OnConflictStrategy.IGNORE);

    const all = await table.queryAll();
    expect(all).toEqual([TUPLE1, TUPLE2]);
  });

  it('should ignore on inserting existed tuple with comparator if the conflict strategy is IGNORE', async () => {
    const sameIdTuple: TestTuple = { ...TUPLE2, id: TUPLE1_ID };
    await table.insert([TUPLE1]);

    await table.insert(
      [sameIdTuple, TUPLE2],
      OnConflictStrategy.IGNORE,
      (x, y) => x.id === y.id
    );

    const all = await table.queryAll();
    expect(all).toEqual([TUPLE1, TUPLE2]);
  });

  it('should replace on inserting existed tuple if the conflict strategy is REPLACE', async () => {
    const sameTuple: TestTuple = { ...TUPLE1 };
    await table.insert([TUPLE1]);

    await table.insert([sameTuple, TUPLE2], OnConflictStrategy.REPLACE);

    const all = await table.queryAll();
    expect(all).toEqual([sameTuple, TUPLE2]);
  });

  it('should replace on inserting existed tuple with comparator if the conflict strategy is REPLACE', async () => {
    const sameIdTuple: TestTuple = { ...TUPLE2, id: TUPLE1_ID };
    await table.insert([TUPLE1]);

    await table.insert(
      [sameIdTuple, TUPLE2],
      OnConflictStrategy.REPLACE,
      (x, y) => x.id === y.id
    );

    const all = await table.queryAll();
    expect(all).toEqual([sameIdTuple, TUPLE2]);
  });

  it('should remove by tuple contents not reference', done => {
    const sameTuple: TestTuple = { ...TUPLE1 };

    defer(async () => {
      await table.insert([TUPLE1]);
      await table.delete([sameTuple]);
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual([]);
        done();
      });
  });

  it('should not emit removed tuples', done => {
    const sameTuple1: TestTuple = { ...TUPLE1 };

    defer(async () => {
      await table.insert([TUPLE1, TUPLE2]);
      await table.delete([sameTuple1]);
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual([TUPLE2]);
        done();
      });
  });

  it('should not emit removed tuples with comparator', done => {
    const sameIdTuple1: TestTuple = { ...TUPLE2, id: TUPLE1_ID };

    defer(async () => {
      await table.insert([TUPLE1, TUPLE2]);
      await table.delete([sameIdTuple1], (x, y) => x.id === y.id);
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual([TUPLE2]);
        done();
      });
  });

  it('should throw on deleting non-existent tuples', async () => {
    await expectAsync(table.delete([TUPLE1])).toBeRejected();
  });

  it('should throw on deleting non-existent tuples with comparator', async () => {
    await table.insert([TUPLE1, TUPLE2]);

    await expectAsync(table.delete([TUPLE1], () => false)).toBeRejected();
  });

  it('should insert atomically', done => {
    const tupleCount = 100;
    const expectedTuples: TestTuple[] = [...Array(tupleCount).keys()].map(
      value => ({
        id: value,
        name: `${value}`,
        happy: true,
        skills: [],
        address: { country: '', city: '' },
      })
    );

    defer(() => Promise.all(expectedTuples.map(tuple => table.insert([tuple]))))
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual(expectedTuples);
        done();
      });
  });

  it('should delete atomically', done => {
    const tupleCount = 100;
    const sourceTuple: TestTuple[] = [...Array(tupleCount).keys()].map(
      value => ({
        id: value,
        name: `${value}`,
        happy: true,
        skills: [],
        address: { country: '', city: '' },
      })
    );

    defer(async () => {
      await table.insert(sourceTuple);
      await Promise.all(sourceTuple.map(tuple => table.delete([tuple])));
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual([]);
        done();
      });
  });

  it('should wipe all data after clear', async () => {
    await table.insert([TUPLE1, TUPLE2]);

    await table.clear();

    expect(await table.queryAll()).toEqual([]);
  });

  it('should be able to reinitialize after clear', async () => {
    await table.insert([TUPLE1, TUPLE2]);
    await table.clear();

    await table.insert([TUPLE1]);

    expect(await table.queryAll()).toEqual([TUPLE1]);
  });

  it('should clear idempotently', async () => {
    await table.insert([TUPLE1]);

    await table.clear();
    await table.clear();

    expect(await table.queryAll()).toEqual([]);
  });

  it('should emit empty data after clear', done => {
    let counter = 0;

    table.queryAll$.subscribe(value => {
      if (counter === 0) {
        expect(value).toEqual([]);
      } else if (counter === 1) {
        expect(value).toEqual([TUPLE1]);
      } else if (counter === 2) {
        expect(value).toEqual([]);
        done();
      }
      counter += 1;
    });

    defer(async () => {
      await table.insert([TUPLE1]);
      await table.clear();
    }).subscribe();
  });

  it('should update proofs', done => {
    const tupleCount = 100;
    const sourceTuple: TestTuple[] = [...Array(tupleCount).keys()].map(
      value => ({
        id: value,
        name: `${value}`,
        happy: true,
        skills: [],
        address: { country: '', city: '' },
      })
    );
    const expectedTuple: TestTuple[] = [...Array(tupleCount).keys()].map(
      value => ({
        id: value,
        name: `${value}`,
        happy: false,
        skills: [],
        address: { country: '', city: '' },
      })
    );

    defer(async () => {
      await table.insert(sourceTuple);
      await table.update(expectedTuple, (x, y) => x.id === y.id);
    })
      .pipe(concatMapTo(table.queryAll$))
      .subscribe(tuples => {
        expect(tuples).toEqual(expectedTuple);
        done();
      });
  });
});

interface TestTuple extends Tuple {
  readonly id: number;
  readonly name: string;
  readonly happy: boolean;
  readonly skills: {
    name: string;
    level: number;
  }[];
  readonly address: {
    country: string;
    city: string;
  };
}

const TUPLE1_ID = 1;
const TUPLE1: TestTuple = {
  id: TUPLE1_ID,
  name: 'Rick Sanchez',
  happy: false,
  skills: [
    {
      name: 'Create Stuff',
      level: Number.POSITIVE_INFINITY,
    },
    {
      name: 'Destroy Stuff',
      level: Number.POSITIVE_INFINITY,
    },
  ],
  address: {
    country: 'USA on Earth C-137',
    city: 'Washington',
  },
};
const TUPLE2_ID = 2;
const TUPLE2: TestTuple = {
  id: TUPLE2_ID,
  name: 'Butter Robot',
  happy: false,
  skills: [
    {
      name: 'Pass Butter',
      level: 1,
    },
    {
      name: 'Oh My God',
      level: Number.NEGATIVE_INFINITY,
    },
  ],
  address: {
    country: 'USA on Earth C-137',
    city: 'Washington',
  },
};
