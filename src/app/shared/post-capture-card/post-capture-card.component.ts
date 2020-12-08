import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DiaBackendAsset } from '../../services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransaction } from '../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { OldDefaultInformationName } from '../../services/repositories/proof/old-proof-adapter';
@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {
  @Input() transaction!: DiaBackendTransaction;
  @Input() asset!: DiaBackendAsset;
  @ViewChild('ratioImg', { static: true }) ratioImg!: ElementRef;
  location!: string;
  openMore = false;

  constructor(private readonly translocoService: TranslocoService) { }

  ngOnInit() {
    const latitude = this.findOldInformation(
      OldDefaultInformationName.GEOLOCATION_LATITUDE
    );
    const longitude = this.findOldInformation(
      OldDefaultInformationName.GEOLOCATION_LONGITUDE
    );
    this.location =
      latitude && longitude
        ? `${latitude}, ${longitude}`
        : this.translocoService.translate('locationNotProvided');
  }

  private findOldInformation(name: string) {
    return this.asset.information.information.find(info => info.name === name)
      ?.value;
  }
}
