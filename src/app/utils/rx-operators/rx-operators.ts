import { Observable } from 'rxjs';
import { filter, mapTo, switchMap } from 'rxjs/operators';

export function isNonNullable<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(
      filter((v): v is NonNullable<T> => v !== null && v !== undefined)
    );
}

export function switchTap<T>(func: (value: T) => Observable<any>) {
  return (source$: Observable<T>) =>
    source$.pipe(switchMap(value => func(value).pipe(mapTo(value))));
}

export function switchTapTo<T>(observable$: Observable<any>) {
  return (source$: Observable<T>) =>
    source$.pipe(switchMap(value => observable$.pipe(mapTo(value))));
}
