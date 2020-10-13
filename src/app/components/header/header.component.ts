import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() headerTitle!: string;
  @Output() next = new EventEmitter();
  @Output() back = new EventEmitter();

  ngOnInit() { }

}
