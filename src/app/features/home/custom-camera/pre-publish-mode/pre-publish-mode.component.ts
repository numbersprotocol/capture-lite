import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FilesystemPlugin } from '@capacitor/filesystem';
import { ColorMatrix, getEditorDefaults } from '@pqina/pintura';
import { BehaviorSubject, combineLatest, EMPTY, of, ReplaySubject } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { FILESYSTEM_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { blobToBase64 } from '../../../../utils/encoding/encoding';

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

  private toggleCropFeature = false;

  private toggleBlackAndWhiteFilter = true;

  readonly curCaptureFilePath$ = new ReplaySubject<string>(1);

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

  @Input()
  set curCaptureFilePath(value: string | undefined) {
    if (value) this.curCaptureFilePath$.next(value);
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
    private readonly filesystemPlugin: FilesystemPlugin
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
    combineLatest([this.curCaptureFilePath$, of(base64)])
      .pipe(
        first(),
        switchMap(([path, data]) =>
          this.filesystemPlugin.writeFile({ path, data })
        ),
        tap(() => this.isProcessingImage$.next(false)),
        tap(() => this.confirm.emit(null)),
        catchError(() => {
          this.isProcessingImage$.next(false);
          return EMPTY;
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
    this.toggleCropFeature = !this.toggleCropFeature;
    this.pinturaEditorOptions$.next({
      ...getEditorDefaults({
        enableUtils: false,
        enableZoomControls: false,
        cropEnableRotationInput: false,
        cropEnableZoomInput: false,
        cropEnableButtonFlipHorizontal: false,
        cropEnableButtonRotateLeft: false,
        cropEnableImageSelection: this.toggleCropFeature,
        enableToolbar: false,
      }),
    });
  }

  onDiscard() {
    this.discard.emit(null);
  }

  async onConfirm() {
    await this.pintura.editor.processImage(this.editorImageState);
  }
}
