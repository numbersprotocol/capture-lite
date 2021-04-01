import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-series',
  templateUrl: './series.page.html',
  styleUrls: ['./series.page.scss'],
})
export class SeriesPage {
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly cover = this.route.snapshot.paramMap.get('cover');

  readonly collectionGeneral = [
    { img: null },
    { img: 'https://material.angular.io/assets/img/examples/shiba1.jpg' },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
  ];
  readonly collectionSpecial = [{ img: null }, { img: null }, { img: null }];
  readonly collectionRare = [
    { img: null },
    { img: 'https://material.angular.io/assets/img/examples/shiba2.jpg' },
    { img: null },
  ];

  constructor(private readonly route: ActivatedRoute) {}
}
