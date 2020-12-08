import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Capacitor,
  Plugins,
  PushNotification,
  PushNotificationToken,
} from '@capacitor/core';
import { tap } from 'rxjs/operators';
import { DiaBackendAssetRepository } from '../dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../dia-backend/auth/dia-backend-auth.service';
import { ImageStore } from '../image-store/image-store.service';
import { getProof } from '../repositories/proof/old-proof-adapter';
import { ProofRepository } from '../repositories/proof/proof-repository.service';

const { Device, PushNotifications } = Plugins;

/**
 * TODO: Refactor this class. Decouple from DIA Backend.
 */

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly proofRepository: ProofRepository,
    private readonly httpClient: HttpClient,
    private readonly imageStore: ImageStore
  ) {}

  configure(): void {
    if (Capacitor.platform === 'web') {
      return;
    }
    this.requestPermission();
    this.addRegisterListener(
      token => {
        this.uploadToken$(token.value).subscribe(() =>
          // tslint:disable-next-line: no-console
          console.log(`token ${token.value} uploaded`)
        );
        const message = `Push registration success, token: ${token.value}`;
        // tslint:disable-next-line: no-console
        console.log(message);
      },
      error => {
        throw error;
      }
    );
    this.addReceivedListener(notification =>
      this.storeExpiredPostCapture(notification)
    );
  }

  private uploadToken$(token: string) {
    return this.diaBackendAuthService.createDevice$(token).pipe(
      // tslint:disable-next-line: no-console
      tap(() => console.log('Token Uploaded!'))
    );
  }

  // tslint:disable-next-line: prefer-function-over-method
  private requestPermission(): void {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        throw Error('Failed to request permission');
      }
    });
  }

  // tslint:disable-next-line: prefer-function-over-method
  private addRegisterListener(
    onSuccess: (token: PushNotificationToken) => void,
    onError: (error: any) => void
  ): void {
    PushNotifications.addListener('registration', onSuccess);
    PushNotifications.addListener('registrationError', onError);
  }

  // tslint:disable-next-line: prefer-function-over-method
  private addReceivedListener(
    callback: (notification: PushNotification) => void
  ): void {
    PushNotifications.addListener('pushNotificationReceived', callback);
  }

  private async storeExpiredPostCapture(pushNotification: PushNotification) {
    const data: NumbersStorageNotification = pushNotification.data;
    if (data.app_message_type !== 'transaction_expired') {
      return;
    }

    const asset = await this.diaBackendAssetRepository
      .getById$(data.id)
      .toPromise();
    await this.diaBackendAssetRepository.addAssetDirectly(asset);
    const rawImage = await this.httpClient
      .get(asset.asset_file, { responseType: 'blob' })
      .toPromise();
    const proof = await getProof(
      this.imageStore,
      rawImage,
      asset.information,
      asset.signature
    );
    await this.proofRepository.add(proof);
  }
}

interface NumbersStorageNotification {
  readonly app_message_type:
    | 'transaction_received'
    | 'transaction_accepted'
    | 'transaction_expired';
  readonly id: string;
}
