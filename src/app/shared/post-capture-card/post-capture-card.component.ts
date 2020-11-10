import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Caption } from 'src/app/services/data/caption/caption';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { Proof } from 'src/app/services/data/proof/proof';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';
import { Asset } from 'src/app/services/publisher/numbers-storage/data/asset/asset';
import { isNonNullable } from 'src/app/utils/rx-operators';

@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {

  @Input() userName!: string;
  @Input() asset!: Asset;
  @Input() imageSrc!: string;

  caption$: Observable<Caption | undefined> = of(undefined);

  openMore = false;

  proof$: Observable<Proof | undefined> = of(undefined);

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly captionRepository: CaptionRepository
  ) { }

  ngOnInit() {
    this.proof$ = this.proofRepository.getByHash$(this.asset.proof_hash);
    this.caption$ = this.proof$.pipe(
      isNonNullable(),
      concatMap(proof => this.captionRepository.getByProof$(proof))
    );
  }
}
