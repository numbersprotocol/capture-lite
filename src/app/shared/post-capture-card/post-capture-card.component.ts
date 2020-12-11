import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { DiaBackendAssetRepository } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransaction } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OldDefaultInformationName } from '../../services/repositories/proof/old-proof-adapter';
import { isNonNullable } from '../../utils/rx-operators/rx-operators';
@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {
  @Input() private readonly transaction!: DiaBackendTransaction;
  @ViewChild('ratioImg', { static: true }) ratioImg!: ElementRef;

  private readonly _transaction$ = new BehaviorSubject(this.transaction);
  readonly transaction$ = this._transaction$
    .asObservable()
    .pipe(isNonNullable());
  readonly asset$ = this.transaction$.pipe(
    concatMap(transaction =>
      this.diaBackendAssetRepository.getById$(transaction.asset.id)
    ),
    isNonNullable()
  );
  readonly location$ = this.asset$.pipe(
    map(asset => {
      // TODO: Find with ProofRepository
      const latitude = asset.information.information.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
      );
      const longitude = asset.information.information.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LONGITUDE
      );
      return latitude && longitude
        ? `${latitude.value}, ${longitude.value}`
        : this.translocoService.translate('locationNotProvided');
    })
  );
  openMore = false;

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit() {
    this._transaction$.next(this.transaction);
  }
}
