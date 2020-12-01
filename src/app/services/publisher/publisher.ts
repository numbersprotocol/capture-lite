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
    const simplifiedIdLength = 6;
    const notification = this.notificationService.createNotification();
    try {
      notification.notify(
        this.translocoService.translate('registeringProof'),
        this.translocoService.translate('message.registeringProof', {
          id: (await proof.getId()).substr(0, simplifiedIdLength),
          publisherName: this.id,
        })
      );

      await this.run(proof);
      notification.cancel();
      return proof;
    } catch (e) {
      this.notificationService.error(e);
    }
  }

  protected abstract async run(proof: Proof): Promise<Proof>;
}
