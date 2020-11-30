import { forkJoin, Observable } from 'rxjs';
import { defaultIfEmpty, filter } from 'rxjs/operators';

export function isNonNullable<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(
      filter((v): v is NonNullable<T> => v !== null && v !== undefined)
    );
}

export function forkJoinWithDefault<T>(
  sources: Observable<T>[],
  defaultValue: T[] = []
) {
  return forkJoin(sources).pipe(defaultIfEmpty(defaultValue));
}
