import { Table, Tuple } from '../table';
import { CapacitorFilesystemTableImpl } from './capacitor-filesystem-table-impl';

describe('MemoryTableImpl', () => {
  let table: Table<TestTuple>;
  const tableId = 'tableId';
  const testTuple1: TestTuple = {
    id: 1,
    name: 'Rick Sanchez',
    happy: false,
    skills: [{
      name: 'Create Stuff',
      level: Number.POSITIVE_INFINITY
    }, {
      name: 'Destroy Stuff',
      level: Number.POSITIVE_INFINITY
    }],
    address: {
      country: 'USA on Earth C-137',
      city: 'Washington'
    }
  };
  const testTuple2: TestTuple = {
    id: 2,
    name: 'Butter Robot',
    happy: false,
    skills: [{
      name: 'Pass Butter',
      level: 1
    }, {
      name: 'Oh My God',
      level: Number.NEGATIVE_INFINITY
    }],
    address: {
      country: 'USA on Earth C-137',
      city: 'Washington'
    }
  };

  beforeEach(() => table = new CapacitorFilesystemTableImpl(tableId));

  afterEach(async () => table.drop());

  it('should be created', () => expect(table).toBeTruthy());

  it('should emit empty array on initial query', done => {
    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should emit new query on inserting tuple', async (done) => {

    await table.insert([testTuple1]);
    await table.insert([testTuple2]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([testTuple1, testTuple2]);
      done();
    });
  });

  it('should throw on inserting same tuple', async () => {
    const sameTuple: TestTuple = { ...testTuple1 };

    await expectAsync(table.insert([testTuple1, sameTuple])).toBeRejected();
  });

  it('should throw on inserting existed tuple', async () => {
    const sameTuple: TestTuple = { ...testTuple1 };
    await table.insert([testTuple1]);

    await expectAsync(table.insert([sameTuple])).toBeRejected();
  });

  it('should remove by tuple contents not reference', async (done) => {
    const sameTuple: TestTuple = { ...testTuple1 };

    await table.insert([testTuple1]);
    await table.delete([sameTuple]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should not emit removed tuples', async (done) => {
    const sameTuple1: TestTuple = { ...testTuple1 };

    await table.insert([testTuple1, testTuple2]);
    await table.delete([sameTuple1]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([testTuple2]);
      done();
    });
  });

  it('should throw on deleting non-existent tuples', async () => {
    await expectAsync(table.delete([testTuple1])).toBeRejected();
  });

  it('inserts atomically', async (done) => {
    const expectedTuples: TestTuple[] = [...Array(100).keys()].map(value => ({
      id: value,
      name: `${value}`,
      happy: true,
      skills: [],
      address: { country: '', city: '' }
    }));

    // tslint:disable-next-line: rxjs-no-unsafe-scope
    await Promise.all(expectedTuples.map(tuple => table.insert([tuple])));

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual(expectedTuples);
      done();
    });
  });

  it('deletes atomically', async (done) => {
    const sourceTuple: TestTuple[] = [...Array(100).keys()].map(value => ({
      id: value,
      name: `${value}`,
      happy: true,
      skills: [],
      address: { country: '', city: '' }
    }));

    await table.insert(sourceTuple);

    // tslint:disable-next-line: rxjs-no-unsafe-scope
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
