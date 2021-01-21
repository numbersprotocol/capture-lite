import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CaptureService } from '../../shared/services/capture/capture.service';
import { blobToBase64 } from '../../utils/encoding/encoding';

@Injectable({
  providedIn: 'root',
})
export class AutoCaptureService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly captureService: CaptureService,
    private readonly alertController: AlertController
  ) {}

  async showDialog() {
    const controller = await this.alertController.create({
      inputs: [
        {
          type: 'number',
          name: 'count',
          min: '1',
          max: '150',
        },
      ],
      buttons: [
        {
          text: 'cancel',
          role: 'cancel',
        },
        {
          text: 'ok',
          handler: (value: { count: string }) => this.run(Number(value.count)),
        },
      ],
    });

    return controller.present();
  }

  private async run(count: number) {
    for (let index = 0; index < count; index += 1) {
      const blob = await this.httpClient
        .get(`/assets/unsample/${index + 1}.jpg`, {
          responseType: 'blob',
        })
        .toPromise();
      this.captureService.capture({
        base64: await blobToBase64(blob),
        mimeType: 'image/jpeg',
      });

      await new Promise<void>(resolve => setTimeout(resolve, 2000));
    }
  }
}

export function pad(value: number | string, size = 10) {
  return String(value).padStart(size);
}
