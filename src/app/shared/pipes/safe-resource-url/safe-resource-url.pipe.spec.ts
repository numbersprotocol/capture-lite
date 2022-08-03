import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrlPipe } from './safe-resource-url.pipe';

describe('SafeResourceUrlPipe', () => {
  let domSanitizerMock: DomSanitizer | null = null;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    domSanitizerMock = {
      sanitize(_, __) {
        return null;
      },
      bypassSecurityTrustHtml: (value: any) => value.toString(),
      bypassSecurityTrustStyle: (value: any) => value.toString(),
      bypassSecurityTrustScript: (value: any) => value.toString(),
      bypassSecurityTrustUrl: (value: any) => value.toString(),
      bypassSecurityTrustResourceUrl: (value: any) => value.toString(),
    };
  });

  it('create an instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pipe = new SafeResourceUrlPipe(domSanitizerMock!);
    expect(pipe).toBeTruthy();
  });
});
