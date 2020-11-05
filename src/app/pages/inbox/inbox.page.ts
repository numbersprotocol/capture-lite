import { Component, OnInit } from '@angular/core';
export interface Inbox {
  file: string;
  name: string;
  updated: Date;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})

export class InboxPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  Inbox: Inbox[] = [
    {
      file: 'Img_12.jpeg',
      name: ' Jamshshd Lin',
      updated: new Date('2/20/16'),
    },
    {
      file: 'Img_13.jpeg',
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      file: 'Img_14.jpeg',
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    }
  ];

}
