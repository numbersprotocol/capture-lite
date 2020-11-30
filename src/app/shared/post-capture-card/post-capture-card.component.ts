import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Transaction } from '../../services/publisher/numbers-storage/numbers-storage-api.service';
import { Asset } from '../../services/publisher/numbers-storage/repositories/asset/asset';
import { OldDefaultInformationName } from '../../services/repositories/proof/old-proof-adapter';
@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Input() asset!: Asset;
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
