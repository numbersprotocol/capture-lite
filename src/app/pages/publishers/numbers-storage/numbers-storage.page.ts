import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs/operators';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-numbers-storage',
  templateUrl: './numbers-storage.page.html',
  styleUrls: ['./numbers-storage.page.scss'],
})
export class NumbersStoragePage {

  constructor(
    private readonly router: Router,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  ionViewWillEnter() {
    this.numbersStorageApi.isEnabled$().pipe(
      tap(isEnabled => {
        // FIXME: do not know why ['login'] does not work
        if (!isEnabled) { this.router.navigate(['/publishers', 'numbers-storage', 'login']); }
      }),
      untilDestroyed(this)
    ).subscribe();
  }

  // FIXME: cannot find a way to make this method readable and reactive
  async logout() {
    const loading = await this.loadingController.create({ message: this.translocoService.translate('talkingToTheServer') });
    await loading.present();
    try {
      await this.numbersStorageApi.logout$().toPromise();
      // FIXME: do not know why ['login'] does not work
      await this.router.navigate(['/publishers', 'numbers-storage', 'login']);
    } catch (e) {
      console.log(e);
      const toast = await this.toastController.create({ message: JSON.stringify(e.error), duration: 4000 });
      await toast.present();
    }
    await loading.dismiss();
  }
}
