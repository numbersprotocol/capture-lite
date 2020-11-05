import { Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Proof } from 'src/app/services/data/proof/proof';

@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent {

  @Input() proof!: Proof;
  @Input() imageSrc!: string;

  openMore = false;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon('media-id', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/media-id.svg'));
  }
}
