import { Component, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { Caption } from 'src/app/services/data/caption/caption';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';

@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {

  @Input() userName!: string;
  @Input() proof!: Proof;
  @Input() imageSrc!: string;

  caption$: Observable<Caption | undefined> = of(undefined);

  openMore = false;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private readonly captionRepository: CaptionRepository
  ) {
    iconRegistry.addSvgIcon('media-id', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/media-id.svg'));
  }

  ngOnInit() {
    this.caption$ = this.captionRepository.getByProof$(this.proof);
  }
}
