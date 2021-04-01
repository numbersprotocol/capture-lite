import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-series',
  templateUrl: './series.page.html',
  styleUrls: ['./series.page.scss'],
})
export class SeriesPage implements OnInit {
  id: string | null | undefined;
  cover: string | null | undefined;
  collectionGeneral = [
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
  collectionSpecial = [{ img: null }, { img: null }, { img: null }];
  collectionRare = [
    { img: null },
    { img: 'https://material.angular.io/assets/img/examples/shiba2.jpg' },
    { img: null },
  ];

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.cover = this.route.snapshot.paramMap.get('cover');
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}
}
