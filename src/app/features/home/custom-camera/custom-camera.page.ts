import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CaptureResult, PreviewCamera } from '@numbersprotocol/preview-camera';
import { BehaviorSubject, combineLatest, interval, Subscription } from 'rxjs';
import {
  finalize,
  map,
  mapTo,
  scan,
  switchMap,
  take,
  takeWhile,
  tap,
  throttleTime,
} from 'rxjs/operators';
import { ErrorService } from '../../../shared/error/error.service';
import { UserGuideService } from '../../../shared/user-guide/user-guide.service';
import { GoProBluetoothService } from '../../settings/go-pro/services/go-pro-bluetooth.service';
import { MAX_RECORD_TIME_IN_MILLISECONDS } from './custom-camera';
import { CustomCameraService } from './custom-camera.service';

type CameraMode = 'story' | 'photo' | 'gopro' | 'pre-publish';
type CameraQuality = 'low' | 'hq';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-custom-camera',
  templateUrl: './custom-camera.page.html',
  styleUrls: ['./custom-camera.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCameraPage implements OnInit, OnDestroy {
  private captureVideoFinishedListener?: PluginListenerHandle;
  private capturePhotoFinishedListener?: PluginListenerHandle;

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  maxRecordTimeInSeconds = MAX_RECORD_TIME_IN_MILLISECONDS / 1000;
  maxRecordTimeInMilliseconds = MAX_RECORD_TIME_IN_MILLISECONDS;
  curRecordTimeInPercent$ = new BehaviorSubject<number>(0);
  isRecording$ = new BehaviorSubject(false);

  mode$ = new BehaviorSubject<CameraMode>('photo');
  lastCaptureMode: CameraMode = 'photo';

  isStoryMode$ = this.mode$.pipe(map(mode => mode === 'story'));
  isPhotoMode$ = this.mode$.pipe(map(mode => mode === 'photo'));
  isGoProMode$ = this.mode$.pipe(map(mode => mode === 'gopro'));
  selectedModeCSSClass$ = this.mode$.pipe(
    map(mode => {
      if (mode === 'story') return 'story-mode-selected';
      if (mode === 'photo') return 'photo-mode-selected';
      if (mode === 'gopro') return 'gopro-mode-selected';
      return '';
    })
  );

  curCaptureFilePath?: string;
  curCaptureMimeType?: 'image/jpeg' | 'video/mp4';
  curCaptureType?: 'image' | 'video' = 'image';
  curCaptureSrc?: string;

  isFlashOn$ = new BehaviorSubject(false);
  isFlashAvailable$ = new BehaviorSubject(false);

  lastZoomScale = 0;
  minZoomFactor$ = new BehaviorSubject(0);
  maxZoomFactor$ = new BehaviorSubject(0);
  curZoomFactor$ = new BehaviorSubject(0);
  cameraZoomEvents$ = new BehaviorSubject<number>(0);

  cameraQuality$ = new BehaviorSubject<CameraQuality>('hq');

  private backButtonPrioritySubscription?: Subscription;

  get canZoomInOut() {
    return this.minZoomFactor$.value < this.maxZoomFactor$.value;
  }

  readonly lastConnectedGoProDevice$ =
    this.goProBluetoothService.lastConnectedDevice$;

  constructor(
    private readonly router: Router,
    private readonly customCameraService: CustomCameraService,
    private readonly goProBluetoothService: GoProBluetoothService,
    private readonly errorService: ErrorService,
    private readonly userGuideService: UserGuideService,
    private readonly platform: Platform
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

    const cameraShouldBeReadyAfter = 1000;
    setTimeout(() => this.syncCameraState(), cameraShouldBeReadyAfter);

    const zoomUpdateFrequency = 10;
    this.cameraZoomEvents$
      .pipe(
        throttleTime(zoomUpdateFrequency),
        switchMap(zoom => this.customCameraService.zoom(zoom)),
        untilDestroyed(this)
      )
      .subscribe();

    this.backButtonPrioritySubscription =
      this.platform.backButton.subscribeWithPriority(1, () => {
        if (this.mode$.value === 'pre-publish') {
          this.discardCurrentCapture();
        } else {
          this.leaveCustomCamera();
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
      this.lastCaptureMode = this.mode$.value;
      this.mode$.next('pre-publish');

      this.stopPreviewCamera();
    }
  }

  async startPreviewCamera() {
    await this.customCameraService.startPreviewCamera();
    await this.customCameraService.setCameraQuality(this.cameraQuality$.value);
    await this.syncCameraState();
    await StatusBar.setStyle({ style: Style.Dark });
  }

  stopPreviewCamera() {
    this.customCameraService.stopPreviewCamera();
  }

  async flipCamera() {
    await this.customCameraService.flipCamera();
    await this.syncCameraState();
  }

  async syncCameraState() {
    this.isFlashOn$.next((await this.isTorchOn()).result);
    this.isFlashAvailable$.next(
      await this.customCameraService.isTorchAvailable()
    );

    if (this.isFlashAvailable$.value) {
      this.minZoomFactor$.next(await this.customCameraService.minZoomFactor());
      this.maxZoomFactor$.next(await this.customCameraService.maxZoomFactor());
      this.customCameraService.zoom(0);
    }
  }

  onPress() {
    if (this.mode$.value === 'photo') {
      this.flashCameraScreen();
      this.customCameraService.takePhoto();
      this.userGuideService.setHasCapturedPhotoWithCustomCamera(true);
    } else {
      if (this.isRecording$.value === true) {
        this.isRecording$.next(false);
      } else {
        this.isRecording$.next(true);
        this.customCameraService.startRecord();
        const intervalRate = 50;
        combineLatest([this.isRecording$, interval(intervalRate)])
          .pipe(
            takeWhile(([isRecording]) => isRecording),
            take(this.maxRecordTimeInMilliseconds / intervalRate),
            untilDestroyed(this),
            mapTo(intervalRate),
            scan((acc: number, curr: number) => acc + curr, 0),
            tap(recordTime => {
              this.curRecordTimeInPercent$.next(
                this.timeInPercents(recordTime)
              );
            }),
            finalize(() => {
              this.isRecording$.next(false);
              this.customCameraService.stopRecord();
              this.curRecordTimeInPercent$.next(0);
            })
          )
          .subscribe();
      }
    }
  }

  private timeInPercents(timeSinceRecording: number): number {
    return Math.floor(
      (timeSinceRecording / this.maxRecordTimeInMilliseconds) *
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        100
    );
  }

  onLongPress() {
    this.userGuideService.setHasCapturedVideoWithCustomCamera(true);
    this.customCameraService.startRecord();
  }

  discardCurrentCapture() {
    if (this.mode$.value === 'pre-publish') {
      this.mode$.next(this.lastCaptureMode);
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
    await this.customCameraService.enableTorch(!this.isFlashOn$.value);
    this.isFlashOn$.next((await this.customCameraService.isTorchOn()).result);
  }

  async focus(event: PointerEvent | MouseEvent) {
    await this.customCameraService.focus(event.x, event.y);
  }

  // eslint-disable-next-line class-methods-use-this
  zoomFactorChange(event: any) {
    const newZooomFactor = event.detail.value;
    this.curZoomFactor$.next(newZooomFactor);
    this.cameraZoomEvents$.next(newZooomFactor);
  }

  handlePinchStart(event: unknown) {
    const e = event as HammerInput;
    this.lastZoomScale = e.scale;
  }

  handlePinchIn(event: unknown) {
    const e = event as HammerInput;
    const zoomOutSensitivity = 2;
    const zoom = Math.abs(e.scale - this.lastZoomScale) / zoomOutSensitivity;
    this.lastZoomScale = e.scale;
    let newZoomFactor = this.curZoomFactor$.value - zoom;
    if (newZoomFactor < this.minZoomFactor$.value) {
      newZoomFactor = this.minZoomFactor$.value;
    }
    this.curZoomFactor$.next(newZoomFactor);
    this.cameraZoomEvents$.next(newZoomFactor);
  }

  handlePinchOut(event: unknown) {
    const e = event as HammerInput;
    const zoomInSensitivity = 8;
    const zoom = Math.abs(e.scale - this.lastZoomScale) / zoomInSensitivity;
    this.lastZoomScale = e.scale;
    let newZoomFactor = this.curZoomFactor$.value + zoom;
    if (newZoomFactor > this.maxZoomFactor$.value) {
      newZoomFactor = this.maxZoomFactor$.value;
    }
    this.curZoomFactor$.next(newZoomFactor);
    this.cameraZoomEvents$.next(newZoomFactor);
  }

  async leaveCustomCamera() {
    this.router.navigate(['..']);
  }

  async captureFromGoPro() {
    await this.customCameraService.stopPreviewCamera();
    this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera'], {
      state: { shouldStartPreviewCameraOnLeave: true },
    });
  }

  setCameraQuality(quality: 'low' | 'hq') {
    this.cameraQuality$.next(quality);
    this.customCameraService.setCameraQuality(quality);
    // TODO: send change camera quality command to native side
  }

  toggleCameraQuality() {
    if (this.cameraQuality$.value === 'hq') this.setCameraQuality('low');
    else this.setCameraQuality('hq');
  }

  selectMode(mode: CameraMode) {
    if (!this.canChangeCameraMode) return;

    // TODO: when we add go pro support make sure
    // 1. stop camera preview
    // before switching to go pro mode
    this.mode$.next(mode);
  }

  onSwipeLeft(_: Event) {
    if (!this.canChangeCameraMode) return;

    if (this.mode$.value === 'story') {
      this.mode$.next('photo');
      return;
    }

    // Temporary disable to use go pro mode.
    // if (this.mode$.value === 'photo') {
    //   // TODO: check if allowed to switch to "gopro"
    //   // TODO: stop camera preview
    //   this.mode$.next('gopro');
    //   return;
    // }
  }

  onSwipeRight(_: Event) {
    if (!this.canChangeCameraMode) return;
    // Temporary disable to use go pro mode.
    // if (this.mode$.value === 'gopro') {
    //   // TODO: check if allowed to switch to photo
    //   // TODO: start camera preview
    //   this.mode$.next('photo');
    //   return;
    // }
    if (this.mode$.value === 'photo') {
      // TODO: check if allowed to switch to "story"
      this.mode$.next('story');
      return;
    }
  }

  private get canChangeCameraMode() {
    return this.isRecording$.value === false;
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
    const element = document.getElementsByClassName('camera-container')[0];
    element.classList.add('flash-camera-animation');
    const flashCameraTimeout = 1000;
    setTimeout(
      () => element.classList.remove('flash-camera-animation'),
      flashCameraTimeout
    );
  }
}
