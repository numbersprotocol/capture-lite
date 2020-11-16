import { Component, Input, OnInit } from '@angular/core';
import { Asset } from 'src/app/services/publisher/numbers-storage/data/asset/asset';
import { Transaction } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@Component({
  selector: 'app-post-capture-card',
  templateUrl: './post-capture-card.component.html',
  styleUrls: ['./post-capture-card.component.scss'],
})
export class PostCaptureCardComponent implements OnInit {

  @Input() transaction!: Transaction;
  @Input() asset!: Asset;

  latitude!: string;
  longitude!: string;

  openMore = false;

  ngOnInit() {
    this.latitude = this.asset.information.information.find(info => info.name === 'Current GPS Latitude')?.value || 'unknown';
    this.longitude = this.asset.information.information.find(info => info.name === 'Current GPS Longitude')?.value || 'unknown';
  }
}
