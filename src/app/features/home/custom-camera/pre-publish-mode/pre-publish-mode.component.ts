import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Directory, FilesystemPlugin } from '@capacitor/filesystem';
import { AlertController, Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { ColorMatrix, getEditorDefaults } from '@pqina/pintura';
import {
  BehaviorSubject,
  ReplaySubject,
  combineLatest,
  defer,
  iif,
  of,
} from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { FILESYSTEM_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { ErrorService } from '../../../../shared/error/error.service';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import { calculateBase64Size } from '../../../../utils/memory';
import { MAX_ALLOWED_UPLOAD_SIZE_IN_BYTES } from '../custom-camera';

type CaptureMimeType = 'image/jpeg' | 'video/mp4';

@Component({
  selector: 'app-pre-publish-mode',
  templateUrl: './pre-publish-mode.component.html',
  styleUrls: ['./pre-publish-mode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrePublishModeComponent {
  readonly pinturaEditorOptions: any = {
    ...getEditorDefaults({
      enableUtils: false,
      enableZoomControls: false,
      cropEnableRotationInput: false,
      cropEnableZoomInput: false,
      cropEnableButtonFlipHorizontal: false,
      cropEnableButtonRotateLeft: false,
      cropEnableImageSelection: false,
      enableToolbar: false,
    }),
  };

  readonly pinturaEditorOptions$: any = new BehaviorSubject<any>(
    this.pinturaEditorOptions
  );

  private editorImageState: any;

  private isCropFeatureEnabled = false;

  private toggleBlackAndWhiteFilter = true;

  readonly curCaptureFileSize$ = new ReplaySubject<number>(1);

  readonly curCaptureFilePath$ = new ReplaySubject<string>(1);

  readonly curCaptureFileName$ = new ReplaySubject<string>(1);

  readonly curCaptureMimeType$ = new ReplaySubject<CaptureMimeType>(1);

  readonly curCaptureSrc$ = new ReplaySubject<string>(1);

  readonly isProcessingImage$ = new BehaviorSubject<boolean>(false);

  readonly isVideo$ = this.curCaptureMimeType$.pipe(
    map(mimeType => mimeType === 'video/mp4')
  );

  readonly isImage$ = this.curCaptureMimeType$.pipe(
    map(mimeType => mimeType === 'image/jpeg')
  );

  readonly curImageBase64$ = combineLatest([
    this.isImage$,
    this.curCaptureFilePath$,
  ]).pipe(
    filter(([isImage, _]) => isImage),
    switchMap(([_, path]) => this.filesystemPlugin.readFile({ path })),
    map(result => `data:image/jpeg;base64,${result.data}`)
  );

  readonly curFileBase64Size$ = this.curCaptureFileSize$.pipe(
    map(fileSize => calculateBase64Size(fileSize))
  );

  readonly maxAllowedFileSize$ = defer(() =>
    of(MAX_ALLOWED_UPLOAD_SIZE_IN_BYTES)
  );

  readonly isFileSizeExceeded$ = combineLatest([
    this.curCaptureFileSize$,
    this.maxAllowedFileSize$,
  ]).pipe(map(([curSize, maxSize]) => curSize < maxSize));

  @Input()
  set curCaptureFileSize(value: number | undefined) {
    if (value) this.curCaptureFileSize$.next(value);
  }

  @Input()
  set curCaptureFilePath(value: string | undefined) {
    if (value) this.curCaptureFilePath$.next(value);
  }

  @Input()
  set curCaptureFileName(value: string | undefined) {
    if (value) this.curCaptureFileName$.next(value);
  }

  @Input()
  set curCaptureMimeType(value: CaptureMimeType | undefined) {
    if (value) this.curCaptureMimeType$.next(value);
  }

  @Input()
  set curCaptureSrc(value: string | undefined) {
    if (value) this.curCaptureSrc$.next(value);
  }

  @Output() discard: EventEmitter<any> = new EventEmitter();

  @Output() confirm: EventEmitter<any> = new EventEmitter();

  @ViewChild('pinturaEditor') pintura?: any;

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin,
    private readonly errorService: ErrorService,
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService,
    private readonly platform: Platform
  ) {}

  handleEditorUpdate(imageState: any): void {
    this.editorImageState = imageState;
  }

  handleEditorProcessStart() {
    this.isProcessingImage$.next(true);
  }

  handleEditorProcessAbort() {
    this.isProcessingImage$.next(false);
  }

  handelEditorProcessError() {
    this.isProcessingImage$.next(false);
  }

  async handleEditorProcess(imageWriterResult: any): Promise<void> {
    const base64 = await blobToBase64(imageWriterResult.dest as File);
    combineLatest([
      this.curCaptureFilePath$,
      of(base64),
      this.isImage$,
      this.curCaptureFileName$,
    ])
      .pipe(
        first(),
        switchMap(([path, data, isImage, fileName]) => {
          if (this.platform.is('android') && isImage) {
            return this.filesystemPlugin.writeFile({
              path: fileName,
              data: data,
              directory: Directory.Cache,
            });
          }
          return this.filesystemPlugin.writeFile({ path, data });
        }),
        tap(() => this.isProcessingImage$.next(false)),
        tap(() => this.confirm.emit(true)),
        catchError((error: unknown) => {
          this.isProcessingImage$.next(false);
          return this.errorService.toastError$(error);
        })
      )
      .subscribe();
  }

  async applyBlackAndWhiteFilter() {
    const monoFilter: ColorMatrix = [
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      0.212, 0.715, 0.114, 0, 0, 0.212, 0.715, 0.114, 0, 0, 0.212, 0.715, 0.114,
      0, 0, 0, 0, 0, 1, 0,
    ];
    const filter = this.toggleBlackAndWhiteFilter ? monoFilter : undefined;
    this.pintura.editor.imageColorMatrix = { filter };
    this.toggleBlackAndWhiteFilter = !this.toggleBlackAndWhiteFilter;
  }

  async toggleCropImageFeature() {
    this.isCropFeatureEnabled = !this.isCropFeatureEnabled;
    this.pinturaEditorOptions$.next({
      ...getEditorDefaults({
        enableUtils: false,
        enableZoomControls: false,
        cropEnableRotationInput: false,
        cropEnableZoomInput: false,
        cropEnableButtonFlipHorizontal: false,
        cropEnableButtonRotateLeft: false,
        cropEnableImageSelection: this.isCropFeatureEnabled,
        enableToolbar: false,
      }),
    });
  }

  onDiscard() {
    this.discard.emit(true);
  }

  async onConfirm() {
    const runConfirmAction$ = this.isImage$.pipe(
      first(),
      tap(isImage => (isImage ? this.confirmImage() : this.confirmVideo()))
    );

    const showIsFileSizeExceededAction$ = defer(() =>
      this.showIsFileSizeExceededModal()
    );

    this.isFileSizeExceeded$
      .pipe(
        first(),
        switchMap(hasEnoughMemory =>
          iif(
            () => hasEnoughMemory,
            runConfirmAction$,
            showIsFileSizeExceededAction$
          )
        ),
        catchError((error: unknown) => this.errorService.toastError$(error))
      )
      .subscribe();
  }

  private confirmImage() {
    /**
     * `this.confirm.emit()` for images will be called from
     * `handleEditorProcess` method which is triggered by
     * `this.pintura.editor.processImage(this.editorImageState)`
     */
    this.pintura.editor.processImage(this.editorImageState);
  }

  private confirmVideo() {
    /**
     * Since there is no pre-processing required for videos,
     * we directly emit a true event to confirm the video.
     */
    this.confirm.emit(true);
  }

  private showIsFileSizeExceededModal() {
    const translations$ = this.translocoService.selectTranslateObject({
      'customCamera.error.fileSizeExeedsLimit': null,
      ok: null,
    });

    translations$
      .pipe(
        first(),
        switchMap(translations => {
          const [fileSizeExeedsLimit, okButtonText] = translations;

          return this.alertController.create({
            message: fileSizeExeedsLimit,
            buttons: [{ text: okButtonText }],
          });
        }),
        tap(alertElement => alertElement.present())
      )
      .subscribe();
  }
}
