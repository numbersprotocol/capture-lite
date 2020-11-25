import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Asset } from 'src/app/services/publisher/numbers-storage/data/asset/asset';
import { Transaction } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
const PREFIX = '--';

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


  constructor() {
    // this.changeTheme(); // Set default theme
  }

  changeTheme() {
    var height = this.myIdentifier.nativeElement.offsetHeight;
    console.log('HeightHeight: ' + height);

    document.documentElement.style.setProperty('--ts-img', height);
  }


  ngAfterViewInit() {
    var width = this.myIdentifier.nativeElement.offsetWidth;
    var height = this.myIdentifier.nativeElement.offsetHeight;
    // ResizeObserve
    console.log('Width:' + width);
    console.log('Height: ' + height);
    // clientHeight
    // height
    console.log('myIdentifier: ', this.myIdentifier);

  }
  readProperty(name: string): string {
    const bodyStyles = window.getComputedStyle(document.body);
    return bodyStyles.getPropertyValue(PREFIX + name);
  }

  @ViewChild('myIdentifier')
  myIdentifier!: ElementRef;


}
