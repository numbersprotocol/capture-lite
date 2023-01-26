import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BUBBLE_IFRAME_URL } from '../../shared/dia-backend/secret';
import { NetworkService } from '../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.page.html',
  styleUrls: ['./terms-of-use.page.scss'],
})
export class TermsOfUsePage {
  readonly networkConnected$ = this.networkService.connected$;
  readonly termsOfUseUrl = `${BUBBLE_IFRAME_URL}/terms_of_use`;
  readonly iframeLoaded$ = new BehaviorSubject(false);

  constructor(
    private readonly networkService: NetworkService,
    private readonly navController: NavController
  ) {}

  ionViewDidEnter() {
    this.processIframeEvents();
  }

  processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;
          if (postMessageEvent.data === 'iframe-on-load') {
            this.iframeLoaded$.next(true);
          }
          if (postMessageEvent.data === 'iframeBackButtonClicked') {
            this.navController.back();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
