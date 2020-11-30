import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification/notification.service';
import { Proof } from '../repositories/proof/proof';

export abstract class Publisher {
  abstract readonly id: string;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService
  ) {}

  abstract isEnabled$(): Observable<boolean>;

  async publish(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    try {
      this.notificationService.notify(
        notificationId,
        this.translocoService.translate('registeringAsset'),
        this.translocoService.translate('message.registeringAsset', {
          hash: await proof.getId(),
          publisherName: this.id,
        })
      );

      await this.run(proof);

      this.notificationService.notify(
        notificationId,
        this.translocoService.translate('assetRegistered'),
        this.translocoService.translate('message.assetRegistered', {
          hash: await proof.getId(),
          publisherName: this.id,
        })
      );

      return proof;
    } catch (e) {
      this.notificationService.notifyError(notificationId, e);
    }
  }

  protected abstract async run(proof: Proof): Promise<Proof>;
}
