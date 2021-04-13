import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MimeType } from '../../../utils/mime-type';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent {
  readonly src$ = new ReplaySubject<SafeUrl>(1);

  @Input()
  set src(value: string | undefined) {
    if (value) this.src$.next(this.sanitizer.bypassSecurityTrustUrl(value));
  }

  private readonly mimeType$ = new ReplaySubject<MimeType>(1);

  @Input()
  set mimeType(value: MimeType | undefined) {
    if (value) this.mimeType$.next(value);
  }

  readonly isImage$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('image'))
  );

  readonly isVideo$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('video'))
  );

  constructor(private readonly sanitizer: DomSanitizer) {}
}
