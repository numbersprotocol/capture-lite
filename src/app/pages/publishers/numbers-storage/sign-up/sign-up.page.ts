import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NumbersStorageApi } from 'src/app/services/publisher/numbers-storage/numbers-storage-api.service';
import { emailValidators, passwordValidators } from 'src/app/utils/validators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {

  readonly signUpForm = this.formBuilder.group({
    userName: ['', Validators.required],
    email: ['', emailValidators],
    password: ['', passwordValidators]
  });

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly numbersStorageApi: NumbersStorageApi
  ) { }

  // FIXME: cannot find a way to make this method readable and reactive
  async signUp() {
    const loading = await this.loadingController.create({ message: this.translocoService.translate('talkingToTheServer') });
    await loading.present();
    try {
      await this.numbersStorageApi.createUser$(
        this.signUpForm.get('userName')?.value,
        this.signUpForm.get('email')?.value,
        this.signUpForm.get('password')?.value
      ).toPromise();
      // FIXME: do not know why ['..'] does not work
      await this.router.navigate(['/publishers', 'numbers-storage']);
    } catch (e) {
      console.log(e);
      const toast = await this.toastController.create({ message: JSON.stringify(e.error), duration: 4000 });
      await toast.present();
    }
    await loading.dismiss();
  }
}
