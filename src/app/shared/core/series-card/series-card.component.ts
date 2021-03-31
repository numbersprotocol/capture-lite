import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-series-card',
  templateUrl: './series-card.component.html',
  styleUrls: ['./series-card.component.scss'],
})
export class SeriesCardComponent {
  @Input() src: any;
}
