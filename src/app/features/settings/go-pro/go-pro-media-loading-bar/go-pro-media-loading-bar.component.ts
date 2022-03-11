import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-go-pro-media-loading-bar',
  templateUrl: './go-pro-media-loading-bar.component.html',
  styleUrls: ['./go-pro-media-loading-bar.component.scss'],
})
export class GoProMediaLoadingBarComponent {
  @Input() loadingText = '';
  @Output() uploadCancel = new EventEmitter<void>();

  cancel() {
    this.uploadCancel.emit();
  }
}
