/* eslint-disable no-console */
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CaptureResult, PreviewCamera } from '@numbersprotocol/preview-camera';
import { BehaviorSubject } from 'rxjs';
import { ErrorService } from '../../../shared/error/error.service';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';
import { GoProBluetoothService } from '../../settings/go-pro/services/go-pro-bluetooth.service';
import {
  CustomCameraMediaItem,
  MAX_RECORD_TIME_IN_MILLISECONDS,
} from './custom-camera';
import { CustomCameraService } from './custom-camera.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-custom-camera',
  templateUrl: './custom-camera.page.html',
  styleUrls: ['./custom-camera.page.scss'],
})
export class CustomCameraPage implements OnInit, OnDestroy {
  private captureVideoFinishedListener?: PluginListenerHandle;
  private capturePhotoFinishedListener?: PluginListenerHandle;

  maxRecordTimeInMilliseconds = MAX_RECORD_TIME_IN_MILLISECONDS;
  curRecordTimeInMilliseconds = 0;
  curRecordTimeInPercent = 0;

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  scaleDownAnimationAfterDelay = 230;

  curSessionCaptureMediaItems: CustomCameraMediaItem[] = [];

  mode$ = new BehaviorSubject<'capture' | 'pre-publish'>('capture');

  curCaptureFilePath?: string;
  curCaptureMimeType?: 'image/jpeg' | 'video/mp4';
  curCaptureType?: 'image' | 'video' = 'image';
  curCaptureSrc?: string;

  readonly lastConnectedGoProDevice$ =
    this.goProBluetoothService.lastConnectedDevice$;

  constructor(
    private readonly location: Location,
    private readonly router: Router,
    private readonly customCameraService: CustomCameraService,
    private readonly goProBluetoothService: GoProBluetoothService,
    private readonly errorService: ErrorService,
    private readonly userGuideService: UserGuideService
  ) {}

  ngOnInit() {
    this.debugOnlyPreventContextMenuFromLongPressContextMenu();

    PreviewCamera.addListener(
      'capturePhotoFinished',
      this.onCapturePhotoFinished.bind(this)
    ).then((listener: any) => (this.capturePhotoFinishedListener = listener));

    PreviewCamera.addListener(
      'captureVideoFinished',
      this.onCaptureVideoFinished.bind(this)
    ).then((listener: any) => (this.captureVideoFinishedListener = listener));

    this.startPreviewCamera();
  }

  async ionViewDidEnter() {
    await this.userGuideService.showUserGuidesOnCustomCameraPage();
    await this.userGuideService.setHasOpenedCustomCameraPage(true);
  }

  ngOnDestroy(): void {
    this.capturePhotoFinishedListener?.remove();
    this.captureVideoFinishedListener?.remove();
    this.stopPreviewCamera();
  }

  // PreviewCamera Plugin methods
  private async onCapturePhotoFinished(data: CaptureResult): Promise<void> {
    this.uploadItem(data, 'image');
  }

  private async onCaptureVideoFinished(data: CaptureResult): Promise<void> {
    this.uploadItem(data, 'video');
  }

  private async uploadItem(data: CaptureResult, type: 'image' | 'video') {
    if (data.errorMessage) {
      await this.errorService.toastError$(data.errorMessage).toPromise();
    } else if (data.filePath) {
      const filePath = data.filePath;

      let mimeType: 'image/jpeg' | 'video/mp4' = 'image/jpeg';
      if (type === 'video') mimeType = 'video/mp4';

      this.curCaptureFilePath = filePath;
      this.curCaptureMimeType = mimeType;
      this.curCaptureType = type;
      this.curCaptureSrc = Capacitor.convertFileSrc(filePath);
      this.mode$.next('pre-publish');

      this.stopPreviewCamera();
    }
  }

  startPreviewCamera() {
    this.customCameraService.startPreviewCamera();
  }

  // eslint-disable-next-line class-methods-use-this
  stopPreviewCamera() {
    this.customCameraService.stopPreviewCamera();
  }

  flipCamera() {
    this.customCameraService.flipCamera();
  }

  onPress() {
    this.userGuideService.setHasCapturedPhotoWithCustomCamera(true);
    this.customCameraService.takePhoto();
    this.flashCameraScreen();
  }

  onLongPress() {
    this.userGuideService.setHasCapturedVideoWithCustomCamera(true);
    this.customCameraService.startRecord();
  }

  onLongPressing(longPressDurationInMilliSeconds: any) {
    this.curRecordTimeInMilliseconds = longPressDurationInMilliSeconds;

    this.curRecordTimeInPercent = Math.floor(
      (this.curRecordTimeInMilliseconds / this.maxRecordTimeInMilliseconds) *
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        100
    );
  }

  onReleasePressing() {
    if (this.curRecordTimeInMilliseconds > 0) {
      this.curRecordTimeInMilliseconds = 0;
      this.curRecordTimeInPercent = 0;
      this.customCameraService.stopRecord();
    }
  }

  discardCurrentCapture() {
    this.mode$.next('capture');
    this.startPreviewCamera();
    this.removeCurrentCapture();
  }

  confirmCurrentCapture() {
    if (this.curCaptureFilePath && this.curCaptureType) {
      this.customCameraService.uploadToCapture(
        this.curCaptureFilePath,
        this.curCaptureType
      );
      this.removeCurrentCapture();
    }
    this.leaveCustomCamera();
  }

  async leaveCustomCamera() {
    return this.location.back();
  }

  async captureFromGoPro() {
    await this.customCameraService.stopPreviewCamera();
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera'], {
      state: { shouldStartPreviewCameraOnLeave: true },
    });
  }

  private removeCurrentCapture() {
    // TODO: remove file this.curCaptureFilePath to free space
    this.curCaptureFilePath = undefined;
    this.curCaptureMimeType = undefined;
    this.curCaptureSrc = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  private debugOnlyPreventContextMenuFromLongPressContextMenu() {
    // Prevent showing context menu on long press
    window.oncontextmenu = function (event: any) {
      const pointerEvent = event as PointerEvent;
      if (pointerEvent.pointerType === 'touch') return false;

      return true;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private flashCameraScreen() {
    const element = document.getElementById('camera-flash-placeholder');
    element?.classList.add('flash-camera-animation');
    const flashCameraTimeout = 1000;
    setTimeout(
      () => element?.classList.remove('flash-camera-animation'),
      flashCameraTimeout
    );
  }
}
