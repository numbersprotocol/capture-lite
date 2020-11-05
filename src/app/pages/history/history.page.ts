import { Component, OnInit } from '@angular/core';
export interface Section {
  file: string;
  name: string;
  updated: Date;
}
export interface History {
  file: string;
  state: string;
  updated: Date;
  color: string;
}
@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})

export class HistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  History: History[] = [
    {
      file: 'Img_12.jpeg',
      state: 'In Progress',
      updated: new Date('1/1/16'),
      color: '"#007AFF"'
    },
    {
      file: 'Img_13.jpeg',
      state: 'Returned',
      updated: new Date('1/17/16'),
      color: 'primary'
    },
    {
      file: 'Img_14.jpeg',
      state: 'Delivered',
      updated: new Date('1/28/16'),
      color: 'accent'
    },
    {
      file: 'Img_15.jpeg',
      state: 'Accepted',
      updated: new Date('1/28/16'),
      color: '#4CD964'
    }
  ];
}
