import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DiaBackendAssetUploadingService } from '../../../../shared/services/dia-backend/asset/uploading/dia-backend-asset-uploading.service';

@Component({
  selector: 'app-uploading-bar',
  templateUrl: './uploading-bar.component.html',
  styleUrls: ['./uploading-bar.component.scss'],
})
export class UploadingBarComponent {
  pendingTasks$ = this.uploadService.pendingTasks$;
  isPaused$ = this.uploadService.isPaused$;
  networkConnected$ = this.uploadService.networkConnected$;
  uploadingBarState$ = combineLatest([
    this.uploadService.pendingTasks$,
    this.uploadService.isPaused$,
    this.uploadService.networkConnected$,
  ]).pipe(
    switchMap(([tasks, isPaused, networkConnected]) =>
      this.getUploadingBarState(tasks, isPaused, networkConnected)
    )
  );

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {}

  pause() {
    this.uploadService.pause();
  }

  resume() {
    this.uploadService.resume();
  }

  private getUploadingBarState(
    tasks: number,
    isPaused: boolean,
    networkConnected: boolean
  ) {
    return this.getUploadingBarText(tasks, isPaused, networkConnected).pipe(
      map(text => {
        const uploadingBarState: UploadingBarState = {
          text,
          spacer: tasks > 0 && networkConnected,
          showProgressBar: tasks > 0 && networkConnected && !isPaused,
          showPauseButton: tasks > 0 && networkConnected && !isPaused,
          showResumeButton: tasks > 0 && networkConnected && isPaused,
        };
        return uploadingBarState;
      })
    );
  }

  private getUploadingBarText(
    tasks: number,
    isPaused: boolean,
    networkConnected: boolean
  ) {
    if (tasks > 0 && networkConnected) {
      return isPaused
        ? this.translocoService.selectTranslate(
            'message.registeringPhotosPaused',
            { photos: tasks }
          )
        : this.translocoService.selectTranslate('message.registeringPhotos', {
            photos: tasks,
          });
    }
    if (!networkConnected) {
      return this.translocoService.selectTranslate(
        'message.networkNotConnected'
      );
    }
    return this.translocoService.selectTranslate('message.allPhotosRegistered');
  }
}

interface UploadingBarState {
  readonly text: string;
  readonly spacer: boolean;
  readonly showProgressBar: boolean;
  readonly showPauseButton: boolean;
  readonly showResumeButton: boolean;
}
