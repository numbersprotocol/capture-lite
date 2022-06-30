/* eslint-disable no-console */
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PluginListenerHandle } from '@capacitor/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CaptureResult, PreviewCamera } from '@numbersprotocol/preview-camera';
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
      this.customCameraService.uploadToCapture(data.filePath, type);
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

  async leaveCustomCamera() {
    return this.location.back();
  }

  async captureFromGoPro() {
    await this.customCameraService.stopPreviewCamera();
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera'], {
      state: { shouldStartPreviewCameraOnLeave: true },
    });
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
    setTimeout(
      () => element?.classList.remove('flash-camera-animation'),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      1000
    );
  }
}
