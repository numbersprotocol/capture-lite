import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-series',
  templateUrl: './series.page.html',
  styleUrls: ['./series.page.scss'],
})
export class SeriesPage {
  readonly id$ = this.route.paramMap.pipe(map(params => params.get('id')));

  readonly cover$ = this.route.paramMap.pipe(
    map(params => params.get('cover'))
  );

  readonly collectionGeneral = [
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
    { img: undefined },
  ];
  readonly collectionSpecial = [
    { img: undefined },
    { img: undefined },
    { img: undefined },
  ];
  readonly collectionRare = [
    { img: undefined },
    { img: undefined },
    { img: undefined },
  ];

  constructor(private readonly route: ActivatedRoute) {}
}
