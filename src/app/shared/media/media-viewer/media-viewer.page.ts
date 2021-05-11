import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';

@Component({
  selector: 'app-media-viewer',
  templateUrl: './media-viewer.page.html',
  styleUrls: ['./media-viewer.page.scss'],
})
export class MediaViewerPage {
  readonly src$ = this.route.paramMap.pipe(
    map(params => params.get('src')),
    isNonNullable(),
    distinctUntilChanged(),
    map(src => this.sanitizer.bypassSecurityTrustUrl(src))
  );

  private readonly mimeType$ = this.route.paramMap.pipe(
    map(params => params.get('mimeType')),
    map(mimeType => mimeType ?? 'image/*'),
    distinctUntilChanged()
  );

  readonly isImage$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('image'))
  );

  readonly isVideo$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('video'))
  );

  constructor(
    private readonly navController: NavController,
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer
  ) {}

  dismiss() {
    this.navController.back();
  }
}
