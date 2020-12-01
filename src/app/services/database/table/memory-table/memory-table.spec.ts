import { Table, Tuple } from '../table';
import { MemoryTable } from './memory-table';

describe('MemoryTable', () => {
  let table: Table<TestTuple>;
  const tableId = 'tableId';
  const tuple1: TestTuple = {
    id: 1,
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
  const tuple2: TestTuple = {
    id: 2,
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

  beforeEach(() => (table = new MemoryTable(tableId)));

  afterEach(async () => table.drop());

  it('should be created', () => expect(table).toBeTruthy());

  it('should emit empty array on initial query', done => {
    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should emit new query on inserting tuple', async done => {
    await table.insert([tuple1]);
    await table.insert([tuple2]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([tuple1, tuple2]);
      done();
    });
  });

  it('should throw on inserting same tuple', async () => {
    const sameTuple: TestTuple = { ...tuple1 };

    await expectAsync(table.insert([tuple1, sameTuple])).toBeRejected();
  });

  it('should throw on inserting existed tuple', async () => {
    const sameTuple: TestTuple = { ...tuple1 };
    await table.insert([tuple1]);

    await expectAsync(table.insert([sameTuple])).toBeRejected();
  });

  it('should remove by tuple contents not reference', async done => {
    const sameTuple: TestTuple = { ...tuple1 };

    await table.insert([tuple1]);
    await table.delete([sameTuple]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should not emit removed tuples', async done => {
    const sameTuple1: TestTuple = { ...tuple1 };

    await table.insert([tuple1, tuple2]);
    await table.delete([sameTuple1]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([tuple2]);
      done();
    });
  });

  it('should throw on deleting non-existent tuples', async () => {
    await expectAsync(table.delete([tuple1])).toBeRejected();
  });

  it('inserts atomically', async done => {
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

    await Promise.all(expectedTuples.map(tuple => table.insert([tuple])));

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual(expectedTuples);
      done();
    });
  });

  it('deletes atomically', async done => {
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

    await table.insert(sourceTuple);

    await Promise.all(sourceTuple.map(tuple => table.delete([tuple])));

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });
});

interface TestTuple extends Tuple {
  id: number;
  name: string;
  happy: boolean;
  skills: {
    name: string;
    level: number;
  }[];
  address: {
    country: string;
    city: string;
  };
}
