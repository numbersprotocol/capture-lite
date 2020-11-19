import { OrderedMap } from 'immutable';

export function sortObjectDeeplyByKey(map: { [key: string]: any; }): OrderedMap<string, any> {
  return OrderedMap(map)
    .sortBy((_, key) => key)
    .map(value => value instanceof Object ? sortObjectDeeplyByKey(value) : value);
}
