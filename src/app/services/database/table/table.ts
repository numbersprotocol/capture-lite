import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface Table<T extends Tuple> {
  queryAll$(): Observable<T[]>;
  insert(tuples: T[]): Promise<T[]>;
  delete(tuples: T[]): Promise<T[]>;
  drop(): Promise<void>;
}

export type Tuple = Record<string, string | number>;

export const TABLE_IMPL = new InjectionToken<Type<Table<any>>>('Table');
