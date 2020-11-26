import { OrderedMap } from 'immutable';

export function sortObjectDeeplyByKey(
  map: SortableMap
): OrderedMap<string, any> {
  return OrderedMap(map)
    .sortBy((_, key) => key)
    .map(value =>
      value instanceof Object ? sortObjectDeeplyByKey(value) : value
    );
}

type SortableMap = { [key: string]: boolean | number | string | SortableMap };
