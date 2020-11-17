import { Table, Tuple } from '../table';
import { MemoryTableImpl } from './memory-table-impl';

describe('MemoryTableImpl', () => {
  let table: Table<TestTuple>;
  const tableId = 'tableId';

  beforeEach(() => table = new MemoryTableImpl(tableId));

  afterEach(async () => table.drop());

  it('should be created', () => expect(table).toBeTruthy());

  it('should emit empty array on initial query', done => {
    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should emit new query on inserting tuple', async (done) => {
    const tuple1: TestTuple = { id: 1, name: 'one' };
    const tuple2: TestTuple = { id: 2, name: 'two' };

    await table.insert([tuple1]);
    await table.insert([tuple2]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([tuple1, tuple2]);
      done();
    });
  });

  it('should throw on inserting same tuple', async () => {
    const tuple: TestTuple = { id: 1, name: 'one' };
    const sameTuple: TestTuple = { ...tuple };

    await expectAsync(table.insert([tuple, sameTuple])).toBeRejected();
  });

  it('should throw on inserting existed tuple', async () => {
    const tuple: TestTuple = { id: 1, name: 'one' };
    const sameTuple: TestTuple = { ...tuple };
    await table.insert([tuple]);

    await expectAsync(table.insert([sameTuple])).toBeRejected();
  });

  it('should remove by tuple contents not reference', async (done) => {
    const newTuple: TestTuple = { id: 5, name: 'five' };
    const sameTuple: TestTuple = { ...newTuple };

    await table.insert([newTuple]);
    await table.delete([sameTuple]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([]);
      done();
    });
  });

  it('should not emit removed tuples', async (done) => {
    const newTuple1: TestTuple = { id: 5, name: 'five' };
    const sameTuple1: TestTuple = { ...newTuple1 };
    const newTuple2: TestTuple = { id: 6, name: 'six' };

    await table.insert([newTuple1, newTuple2]);
    await table.delete([sameTuple1]);

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual([newTuple2]);
      done();
    });
  });

  it('should throw on deleting non-existent tuples', async () => {
    const tuple: TestTuple = { id: 5, name: 'five' };
    await expectAsync(table.delete([tuple])).toBeRejected();
  });

  it('inserts atomically', async (done) => {
    const expectedTuples: TestTuple[] = [...Array(100).keys()].map(value => ({ id: value, name: `${value}` }));

    // tslint:disable-next-line: rxjs-no-unsafe-scope
    await Promise.all(expectedTuples.map(tuple => table.insert([tuple])));

    table.queryAll$().subscribe(tuples => {
      expect(tuples).toEqual(expectedTuples);
      done();
    });
  });

  it('deletes atomically', async (done) => {
    const sourceTuple: TestTuple[] = [...Array(100).keys()].map(value => ({ id: value, name: `${value}` }));

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
}
