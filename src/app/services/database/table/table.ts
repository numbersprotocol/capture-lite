import { Observable } from 'rxjs';

export interface Table<T extends Tuple> {
  readonly id: string;
  queryAll$(): Observable<T[]>;
  insert(tuples: T[]): Promise<T[]>;
  delete(tuples: T[]): Promise<T[]>;
  drop(): Promise<void>;
}

export interface Tuple {
  [key: string]: boolean | number | string | Tuple | Tuple[];
}
