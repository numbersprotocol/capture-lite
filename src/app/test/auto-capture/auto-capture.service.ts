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
    await Promise.all(
      [...Array(count).keys()].map(async index => {
        const blob = await this.httpClient
          .get(`/assets/test/unsample/${index + 1}.jpg/`, {
            responseType: 'blob',
          })
          .toPromise();
        await this.captureService.capture({
          base64: await blobToBase64(blob),
          mimeType: 'image/jpeg',
        });
      })
    );
  }
}
