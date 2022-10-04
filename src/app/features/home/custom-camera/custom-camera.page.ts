/* eslint-disable no-console */
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CaptureResult, PreviewCamera } from '@numbersprotocol/preview-camera';
import { BehaviorSubject, Subscription } from 'rxjs';
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

  isFlashOn = false;
  isFlashAvailable = false;

  minZoomFactor = 0;
  maxZoomFactor = 0;
  curZoomFactor = 0;

  cameraQuality: 'low' | 'hq' = 'hq';
  cameraGesture: any;

  private backButtonPrioritySubscription?: Subscription;

  get canZoomInOut() {
    return this.minZoomFactor < this.maxZoomFactor;
  }

  readonly lastConnectedGoProDevice$ =
    this.goProBluetoothService.lastConnectedDevice$;

  constructor(
    private readonly location: Location,
    private readonly router: Router,
    private readonly customCameraService: CustomCameraService,
    private readonly goProBluetoothService: GoProBluetoothService,
    private readonly errorService: ErrorService,
    private readonly userGuideService: UserGuideService,
    private readonly platform: Platform,
    private readonly navCtrl: NavController
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

    this.syncCameraState();
  }

  async ionViewDidEnter() {
    await this.userGuideService.showUserGuidesOnCustomCameraPage();
    await this.userGuideService.setHasOpenedCustomCameraPage(true);

    this.backButtonPrioritySubscription =
      this.platform.backButton.subscribeWithPriority(1, () => {
        if (this.mode$.value === 'pre-publish') {
          this.discardCurrentCapture();
        } else {
          this.navCtrl.back();
        }
      });
  }

  ionViewWillLeave() {
    this.backButtonPrioritySubscription?.unsubscribe();
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

  async startPreviewCamera() {
    await this.customCameraService.startPreviewCamera();
    await this.customCameraService.setCameraQuality(this.cameraQuality);
    await this.syncCameraState();
  }

  // eslint-disable-next-line class-methods-use-this
  stopPreviewCamera() {
    this.customCameraService.stopPreviewCamera();
  }

  async flipCamera() {
    await this.customCameraService.flipCamera();
    await this.syncCameraState();
  }

  async syncCameraState() {
    this.isFlashOn = (await this.isTorchOn()).result;
    this.isFlashAvailable = await this.customCameraService.isTorchAvailable();

    if (this.isFlashAvailable) {
      this.minZoomFactor = await this.customCameraService.minZoomFactor();
      this.maxZoomFactor = await this.customCameraService.maxZoomFactor();
      this.customCameraService.zoom(0);
      console.log(`maxZoomFactor: ${this.maxZoomFactor}`);
    }
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
    if (this.mode$.value === 'pre-publish') {
      this.mode$.next('capture');
      this.startPreviewCamera();
      this.removeCurrentCapture();
    }
  }

  async confirmCurrentCapture() {
    if (this.curCaptureFilePath && this.curCaptureType) {
      this.customCameraService.uploadToCapture(
        this.curCaptureFilePath,
        this.curCaptureType
      );
      this.leaveCustomCamera();
    }
  }

  async isTorchOn() {
    return this.customCameraService.isTorchOn();
  }

  async enableTorch() {
    await this.customCameraService.enableTorch(!this.isFlashOn);
    this.isFlashOn = (await this.customCameraService.isTorchOn()).result;
  }

  // eslint-disable-next-line class-methods-use-this
  async focus(event: PointerEvent | MouseEvent) {
    await this.customCameraService.focus(event.x, event.y);
  }

  // eslint-disable-next-line class-methods-use-this
  zoomFactorChange(event: any) {
    this.customCameraService.zoom(event.detail.value);
  }

  // eslint-disable-next-line class-methods-use-this
  zoomFactorChanging(value: any) {
    console.log(value);
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

  setCameraQuality(quality: 'low' | 'hq') {
    this.cameraQuality = quality;
    this.customCameraService.setCameraQuality(quality);
    // TODO: send change camera quality command to native side
  }

  private removeCurrentCapture() {
    this.customCameraService.removeFile(this.curCaptureFilePath);
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
