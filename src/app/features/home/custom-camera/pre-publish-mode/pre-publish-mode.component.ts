import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pre-publish-mode',
  templateUrl: './pre-publish-mode.component.html',
  styleUrls: ['./pre-publish-mode.component.scss'],
})
export class PrePublishModeComponent {
  @Input()
  curCaptureFilePath?: string;

  @Input()
  curCaptureMimeType?: 'image/jpeg' | 'video/mp4';

  @Input()
  curCaptureSrc?: string;

  @Output() discard: EventEmitter<any> = new EventEmitter();

  @Output() confirm: EventEmitter<any> = new EventEmitter();

  onDiscard() {
    this.discard.emit(null);
  }

  onConfirm() {
    this.confirm.emit(null);
  }
}
