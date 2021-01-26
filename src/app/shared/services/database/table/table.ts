import { Observable } from 'rxjs';

export interface Table<T extends Tuple> {
  readonly id: string;
  readonly queryAll$: Observable<T[]>;
  queryAll(): Promise<T[]>;
  insert(
    tuples: T[],
    onConflict?: OnConflictStrategy,
    comparator?: (x: T, y: T) => boolean
  ): Promise<T[]>;
  delete(tuples: T[], comparator?: (x: T, y: T) => boolean): Promise<T[]>;
  update(newTuple: T, comparator: (x: T, y: T) => boolean): Promise<T>;
  bulkUpdate(tuples: T[], comparator: (x: T, y: T) => boolean): Promise<T[]>;
  drop(): Promise<void>;
}

export interface Tuple {
  readonly [key: string]:
    | boolean
    | number
    | string
    | undefined
    | null
    | Tuple
    | Tuple[];
}

export const enum OnConflictStrategy {
  ABORT,
  IGNORE,
  REPLACE,
}
