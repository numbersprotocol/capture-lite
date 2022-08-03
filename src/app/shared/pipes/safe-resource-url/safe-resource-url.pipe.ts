import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceUrl',
})
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(url: any): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
