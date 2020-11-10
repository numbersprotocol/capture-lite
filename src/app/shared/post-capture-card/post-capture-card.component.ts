import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, map, pluck, switchMap } from 'rxjs/operators';
import { CapacitorProvider } from 'src/app/services/collector/information/capacitor-provider/capacitor-provider';
import { Caption } from 'src/app/services/data/caption/caption';
import { CaptionRepository } from 'src/app/services/data/caption/caption-repository.service';
import { InformationRepository } from 'src/app/services/data/information/information-repository.service';
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

  proof$!: Observable<Proof>;
  caption$!: Observable<Caption>;
  location$!: Observable<string>;

  openMore = false;

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly captionRepository: CaptionRepository
  ) { }

  ngOnInit() {
    this.proof$ = this.proofRepository.getByHash$(this.asset.proof_hash).pipe(
      isNonNullable()
    );
    this.caption$ = this.proof$.pipe(
      isNonNullable(),
      concatMap(proof => this.captionRepository.getByProof$(proof)),
      isNonNullable()
    );
    this.location$ = this.proof$.pipe(
      switchMap(proof => this.informationRepository.getByProof$(proof)),
      map(informationList => informationList.find(information => information.provider === CapacitorProvider.ID && information.name === 'Location')),
      isNonNullable(),
      pluck('value')
    );
  }
}
