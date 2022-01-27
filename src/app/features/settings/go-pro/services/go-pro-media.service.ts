import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import '@capacitor-community/http';
import { HttpDownloadFileResult } from '@capacitor-community/http';
import {
  Capacitor,
  FilesystemDirectory,
  FilesystemPlugin,
  Plugins,
} from '@capacitor/core';
import { isPlatform } from '@ionic/core';
import { FILESYSTEM_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { CaptureService } from '../../../../shared/capture/capture.service';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import { GoProFile, GoProFileOnDevice } from '../go-pro-media-file';
const { Http, Storage } = Plugins;

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

  static getFileType(url?: string): 'unknown' | 'video' | 'image' {
    if (url === undefined) {
      return 'unknown';
    }
    if (url.toLowerCase().includes('.mp4')) {
      return 'video';
    }
    if (
      url.toLowerCase().includes('.jpg') ||
      url.toLowerCase().includes('.jpeg')
    ) {
      return 'image';
    }
    return 'unknown';
  }

  static extractFileNameFromUrl(url: string): string {
    // return extract filename with extension from url
    // example 001.jpg, 002.mp4
    return url.split('?')[0].split('/').pop()!;
  }

  static extractFileExtensionFormUrl(filaName: string): string {
    return filaName.split('?')[0].split('.').pop()!;
  }

  static extractFileNameFromGoProUrl(url: string): string {
    // example of GoPro urls
    // _________url: http://10.5.5.9:8080/videos/DCIM/100GOPRO/GH010168.MP4
    // thumbnailUrl: http://10.5.5.9:8080/gopro/media/thumbnail?path=100GOPRO/GH010168.MP4
    return url.split('/').pop()!;
  }

  static extractFileExtensionFromGoProUrl(url: string): string {
    return url.split('.').pop()!;
  }

  static urlIsImage(url: string): boolean {
    const url_lowercase = url.toLocaleLowerCase();
    return url_lowercase.includes('.jpeg') || url_lowercase.includes('.jpg');
  }

  static urlIsVideo(url: string): boolean {
    const url_lowercase = url.toLowerCase();
    return url_lowercase.includes('.mp4');
  }

  static detectFileTypeFromUrl(url: string): 'image' | 'video' | 'unknown' {
    if (GoProMediaService.urlIsImage(url)) {
      return 'image';
    }
    if (GoProMediaService.urlIsVideo(url)) {
      return 'video';
    }
    return 'unknown';
  }

  private async saveFilesToStorage(files: GoProFileOnDevice[]) {
    await Storage.set({
      key: this.GO_PRO_FILES_ON_DEVICE_STORAGE_KEY,
      value: JSON.stringify(files),
    });
  }

  async clearStorage() {
    await this.saveFilesToStorage([]);
  }

  getThumbnailUrlFrom(url: string): string {
    const fileName = url.split('/').pop();
    const thumbnailUrl = `${this.goproBaseUrl}/gopro/media/thumbnail?path=100GOPRO/${fileName}`;
    return thumbnailUrl;
  }

  async uploadToCaptureFromGoProCamera(mediaFile: GoProFile | undefined) {
    if (!mediaFile) return;

    const fileName = GoProMediaService.extractFileNameFromGoProUrl(
      mediaFile.url
    );

    // const option = 'oldWay';
    // if (option === 'oldWay') {
    await Http.downloadFile({
      url: mediaFile.url!,
      filePath: fileName,
      fileDirectory: this.directory,
      method: 'GET',
    });

    const readResult = await this.filesystemPlugin.getUri({
      directory: this.directory,
      // path: `${this.rootDir}/${goProFileOnDevice.name}`,
      path: `${fileName}`, //  Because when saving we forget to add rootDir
    });

    const url = Capacitor.convertFileSrc(readResult.uri);

    const blob = await this.httpClient
      .get(url, { responseType: 'blob' })
      .toPromise();

    const base64 = await blobToBase64(blob);

    const mimeType = GoProMediaService.urlIsImage(mediaFile.url)
      ? 'image/jpeg'
      : 'video/mp4';

    await this.captureService.capture({ base64, mimeType });

    // delete temp downloaded file
    await this.filesystemPlugin.deleteFile({
      directory: this.directory,
      // path: `${this.rootDir}/${goProFileOnDevice.name}`,
      path: `${fileName}`, //  Because when saving we forget to add rootDir
    });
    // } else {
    //   const url = mediaFile.url;

    //   const blob = await Http.request({
    //     method: 'GET',
    //     url: url,
    //     headers: { responseType: 'blob' },
    //   });

    //   const base64 = await blobToBase64(blob);

    //   const mimeType = this.urlIsImage(url) ? 'image/jpeg' : 'video/mp4';

    //   await this.captureService.capture({ base64, mimeType });
    // }
  }

  async getFileSrcFromDevice(filePath: string): Promise<SafeUrl> {
    const fileName = filePath.split('/').pop();

    const result = await this.filesystemPlugin.getUri({
      directory: this.directory,
      // path: `${this.rootDir}/${fileName}`,
      path: `${fileName}`, // Because when saving we forget to add rootDir
    });

    const uri = result.uri;

    const url = Capacitor.convertFileSrc(uri);

    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  async uploadToCaptureFromDevice(goProFileOnDevice?: GoProFileOnDevice) {
    if (!goProFileOnDevice) return;

    // const option = 'oldWay';
    // if (option !== 'oldWay') {
    //   const readResult = await this.filesystemPlugin.readFile({
    //     directory: this.directory,
    //     // path: `${this.rootDir}/${goProFileOnDevice.name}`,
    //     path: `${goProFileOnDevice.name}`, //  Because when saving we forget to add rootDir
    //   });

    //   const base64 = readResult.data;

    //   const mimeType = this.urlIsImage(goProFileOnDevice.url)
    //     ? 'image/jpeg'
    //     : 'video/mp4';

    //   await this.captureService.capture({ base64, mimeType });
    // } else {
    const result = await this.filesystemPlugin.getUri({
      directory: this.directory,
      // path: `${this.rootDir}/${goProFileOnDevice.name}`,
      path: `${goProFileOnDevice.name}`, //  Because when saving we forget to add rootDir
    });

    const url = Capacitor.convertFileSrc(result.uri);

    const blob = await this.httpClient
      .get(url, { responseType: 'blob' })
      .toPromise();

    const base64 = await blobToBase64(blob);

    const mimeType = GoProMediaService.urlIsImage(goProFileOnDevice.url)
      ? 'image/jpeg'
      : 'video/mp4';

    await this.captureService.capture({ base64, mimeType });
    // }
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
      name: GoProMediaService.extractFileNameFromGoProUrl(url),
      type: GoProMediaService.detectFileTypeFromUrl(url),
    };
  }

  async loadFilesFromStorage() {
    const result = await Storage.get({
      key: this.GO_PRO_FILES_ON_DEVICE_STORAGE_KEY,
    });
    const filesOnDevice: GoProFileOnDevice[] = JSON.parse(result.value ?? '[]');
    return filesOnDevice;
  }

  async addFileToStorage(fileToAdd: GoProFileOnDevice) {
    const filesOnDevice = await this.loadFilesFromStorage();
    filesOnDevice.unshift(fileToAdd);
    await this.saveFilesToStorage(filesOnDevice);
  }

  async downloadFromGoProCamera(mediaFile?: GoProFile) {
    if (!mediaFile) {
      return;
    }
    const fileName = GoProMediaService.extractFileNameFromGoProUrl(
      mediaFile.url
    );
    // const fileExtension = GoProMediaService.extractFileExtensionFromGoProUrl(
    //   mediaFile.url
    // );
    const fileType = GoProMediaService.detectFileTypeFromUrl(mediaFile.url);

    const thumbName = GoProMediaService.extractFileNameFromGoProUrl(
      mediaFile.thumbnailUrl!
    );
    const thumbNameFull = 'thumbnail_' + thumbName + '.jpeg';

    const fileResponse: HttpDownloadFileResult = await Http.downloadFile({
      url: mediaFile.url!,
      filePath: fileName,
      fileDirectory: this.directory,
      method: 'GET',
    });

    const thumbResponse: HttpDownloadFileResult = await Http.downloadFile({
      url: mediaFile.thumbnailUrl!,
      filePath: thumbNameFull,
      fileDirectory: this.directory,
      method: 'GET',
    });

    const goProFileOnDevice: GoProFileOnDevice = {
      name: fileName,
      url: fileResponse.path!,
      thumbnailUrl: thumbResponse.path!,
      size: 1, // TODO: find out size of file
      type: fileType,
    };

    await this.addFileToStorage(goProFileOnDevice);
  }
}
