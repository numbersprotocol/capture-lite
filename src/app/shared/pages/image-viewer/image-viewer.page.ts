import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
})
export class ImageViewerPage {
  readonly src$ = this.route.paramMap.pipe(
    map(params => params.get('src')),
    isNonNullable(),
    distinctUntilChanged(),
    map(src => this.sanitizer.bypassSecurityTrustUrl(src))
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
