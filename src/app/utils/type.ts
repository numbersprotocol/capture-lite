import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function isNonNullable<T>() {
  return (source$: Observable<null | undefined | T>) => source$.pipe(
    filter(valueIsNonNullable)
  );
}

function valueIsNonNullable<T>(value: null | undefined | T): value is T {
  return value !== null && value !== undefined;
}
