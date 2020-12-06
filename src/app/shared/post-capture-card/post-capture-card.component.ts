import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
  latitude!: string;
  longitude!: string;
  openMore = false;

  ngOnInit() {
    this.latitude =
      this.asset.information.information.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LATITUDE
      )?.value || 'unknown';
    this.longitude =
      this.asset.information.information.find(
        info => info.name === OldDefaultInformationName.GEOLOCATION_LONGITUDE
      )?.value || 'unknown';
  }
}
