import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import '@capacitor-community/http';
import { Http } from '@capacitor-community/http';
import { CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  Directory as FilesystemDirectory,
  FilesystemPlugin,
} from '@capacitor/filesystem';
import { isPlatform } from '@ionic/core';
import {
  detectFileTypeFromUrl,
  extractFileNameFromGoProUrl,
  urlIsImage,
} from '../../../../../utils/url';
import { FILESYSTEM_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { CaptureService } from '../../../../shared/capture/capture.service';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import { GoProFile } from '../go-pro-media-file';

@Injectable({
  providedIn: 'root',
})
export class GoProMediaService {
  private readonly GO_PRO_FILES_ON_DEVICE_STORAGE_KEY =
    'GO_PRO_FILES_ON_DEVICE_STORAGE_KEY';
  private readonly directory = isPlatform('ios')
    ? FilesystemDirectory.Documents
    : FilesystemDirectory.Data;

  private readonly rootDir = 'ImageStore';

  private readonly goproBaseUrl = 'http://10.5.5.9:8080';

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin,
    private readonly sanitizer: DomSanitizer,
    private readonly captureService: CaptureService,
    private readonly httpClient: HttpClient
  ) {}

  getThumbnailUrlFrom(url: string): string {
    const fileName = url.split('/').pop();
    const thumbnailUrl = `${this.goproBaseUrl}/gopro/media/thumbnail?path=100GOPRO/${fileName}`;
    return thumbnailUrl;
  }

  async uploadToCaptureFromGoProCamera(
    mediaFile: GoProFile | undefined
  ): Promise<{
    isDownloaded: boolean;
    isCaptured: boolean;
  }> {
    if (!mediaFile) return { isDownloaded: false, isCaptured: false };

    const fileName = extractFileNameFromGoProUrl(mediaFile.url);

    let isDownloaded = false;
    let isCaptured = false;

    try {
      await Http.downloadFile({
        url: mediaFile.url,
        filePath: fileName,
        fileDirectory: this.directory,
        method: 'GET',
      });

      const readResult = await this.filesystemPlugin.getUri({
        directory: this.directory,
        path: fileName,
      });

      const url = Capacitor.convertFileSrc(readResult.uri);

      const blob = await this.httpClient
        .get(url, { responseType: 'blob' })
        .toPromise();

      const base64 = await blobToBase64(blob);

      const mimeType = urlIsImage(mediaFile.url) ? 'image/jpeg' : 'video/mp4';
      isDownloaded = true;

      await this.captureService.capture({
        base64,
        mimeType,
        source: CameraSource.Camera,
      });
      isCaptured = true;

      // delete temp downloaded file
      await this.filesystemPlugin.deleteFile({
        directory: this.directory,
        path: fileName,
      });
    } catch (error: any) {
      const printIndentation = 2;
      // eslint-disable-next-line no-console
      console.warn(`'😭 ${JSON.stringify(error, null, printIndentation)}`);
    }

    return { isDownloaded, isCaptured };
  }

  async getFilesFromGoPro(): Promise<GoProFile[]> {
    const url = this.goproBaseUrl + '/gopro/media/list';
    const params = {};
    const headers = {};
    const response = await Http.request({
      method: 'GET',
      url,
      headers,
      params,
    });

    const data = response.data;
    const files = (data.media[0].fs as any[]).reverse();
    const fileNames: string[] = files.map(e => e.n);

    return fileNames
      .map(fileName => `${this.goproBaseUrl}/videos/DCIM/100GOPRO/${fileName}`)
      .map(this.generateGoProFileFromUrl.bind(this));
  }

  private generateGoProFileFromUrl(url: string): GoProFile {
    return {
      url,
      storageKey: undefined,
      thumbnailUrl: this.getThumbnailUrlFrom(url),
      name: extractFileNameFromGoProUrl(url),
      type: detectFileTypeFromUrl(url),
    };
  }
}
