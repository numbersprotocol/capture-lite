import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PreviewVideo } from '@numbersprotocol/preview-video';
import { BehaviorSubject, ReplaySubject, combineLatest, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { MimeType } from '../../../utils/mime-type';
import { ErrorService } from '../../error/error.service';

@UntilDestroy()
@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements AfterViewInit, OnDestroy {
  readonly src$ = new ReplaySubject<SafeUrl>(1);
  readonly isLoading$ = new BehaviorSubject<boolean>(true);

  private readonly globalCSSClass = 'custom-camera-transparent-background';

  previewVideoId = 'previewVideoId';
  previewVideo?: PreviewVideo;
  readonly previewVideoFilePath$ = new ReplaySubject<string>(1);
  private createNativePlayerTimeoutId: number | null = null;

  @Input()
  set src(value: string | undefined) {
    if (value) this.src$.next(this.sanitizer.bypassSecurityTrustUrl(value));
  }

  private readonly mimeType$ = new ReplaySubject<MimeType>(1);

  @Input()
  set mimeType(value: MimeType | undefined) {
    if (value) this.mimeType$.next(value);
  }

  readonly isImage$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('image'))
  );

  readonly isVideo$ = this.mimeType$.pipe(
    map(mimeType => mimeType.startsWith('video'))
  );

  readonly playWithAndroidNativePlayer$ = combineLatest([
    this.isVideo$,
    of(Capacitor.getPlatform() == 'android'),
  ]).pipe(map(([isVideo, isAndroid]) => isVideo && isAndroid));

  @Input()
  set filePath(value: string | undefined) {
    if (value) this.previewVideoFilePath$.next(value);
  }

  @ViewChild('previewVideo', { static: false })
  previewVideoRef: ElementRef | null = null;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly ref: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService
  ) {}

  ngAfterViewInit(): void {
    const waitForWebviewToRecover = 700;
    this.createNativePlayerTimeoutId = window.setTimeout(() => {
      this.createNativePlayer();
    }, waitForWebviewToRecover);
  }

  onImageLoaded() {
    this.isLoading$.next(false);
  }

  onVideoLoaded() {
    this.isLoading$.next(false);
  }

  /**
   * WORKAROUND: https://github.com/numbersprotocol/capture-lite/issues/2845
   * Purpose: Use android native player to play 4k videos.
   * 4k videos cannot be played with HTML video tag on some Android devices because
   * of Android's WebView limitation. Using a native player helps to circumvent this issue.
   * Note: iOS WebViews can play 4k videos without any issues.
   */
  private createNativePlayer() {
    this.playWithAndroidNativePlayer$
      .pipe(
        filter(playWithAndroidNativePlayer => playWithAndroidNativePlayer),
        switchMap(() => this.previewVideoFilePath$),
        tap(_ => {
          this.onVideoLoaded();
          this.ref.detectChanges();
        }),
        switchMap(previewVideoFilePath => {
          if (this.previewVideoRef?.nativeElement) {
            return PreviewVideo.create({
              id: this.previewVideoId,
              src: previewVideoFilePath,
              element: this.previewVideoRef.nativeElement,
              config: {},
            });
          }
          throw Error('previewVideoRef not found.');
        }),
        map(previewVideo => {
          this.addCSSClass();
          return (this.previewVideo = previewVideo);
        }),
        catchError((_err: unknown) => {
          /**
           * Error handling: In case the creation of the native player fails,
           * an error should be reported to the crash reporting system (currently not in place).
           * TODO: Implement error reporting to the crash reporting system when available.
           */
          return this.errorService.toastError$(
            this.translocoService.translate('error.unknownError')
          );
        }),
        untilDestroyed(this, 'destroyNativePlayer')
      )
      .subscribe();
  }

  destroyNativePlayer() {
    if (this.createNativePlayerTimeoutId !== null) {
      window.clearTimeout(this.createNativePlayerTimeoutId);
    }
    this.removeCSSClass();
    this.previewVideo?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyNativePlayer();
  }

  /**
   * Adds a CSS class to the body and ion-app elements.
   * This is needed for the correct visualization of the preview video.
   * The custom CSS class ('custom-camera-transparent-background')
   * makes the background transparent.
   */
  private addCSSClass() {
    // Add the CSS class to the body element
    this.renderer.addClass(
      this.elementRef.nativeElement.ownerDocument.body,
      this.globalCSSClass
    );
    // Add the CSS class to the ion-app element
    this.renderer.addClass(
      this.elementRef.nativeElement.ownerDocument.querySelector('ion-app'),
      this.globalCSSClass
    );
  }

  /**
   * Removes the previously added CSS class from the body and ion-app elements.
   * This is necessary to clean up the changes made when the component is destroyed,
   * and the native player is no longer needed.
   */
  private removeCSSClass() {
    // Remove the CSS class from the body element
    this.renderer.removeClass(
      this.elementRef.nativeElement.ownerDocument.body,
      this.globalCSSClass
    );
    // Remove the CSS class from the ion-app element
    this.renderer.removeClass(
      this.elementRef.nativeElement.ownerDocument.querySelector('ion-app'),
      this.globalCSSClass
    );
  }
}
