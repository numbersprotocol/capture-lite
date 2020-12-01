import { InjectionToken, Type } from '@angular/core';
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

export const TABLE_IMPL = new InjectionToken<Type<Table<any>>>('TABLE_IMPL');
