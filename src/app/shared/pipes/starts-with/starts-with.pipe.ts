import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'startsWith',
})
export class StartsWithPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: string, prefix: string) {
    return value.startsWith(prefix);
  }
}
