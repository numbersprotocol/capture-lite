import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BUBBLE_IFRAME_URL } from '../../shared/dia-backend/secret';
import { BubbleToIonicPostMessage } from '../../shared/iframe/iframe';
import { NetworkService } from '../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-data-policy',
  templateUrl: './data-policy.page.html',
  styleUrls: ['./data-policy.page.scss'],
})
export class DataPolicyPage {
  readonly networkConnected$ = this.networkService.connected$;
  readonly dataPolicyUrl = `${BUBBLE_IFRAME_URL}/data_policy`;
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
          const data = postMessageEvent.data as BubbleToIonicPostMessage;
          switch (data) {
            case BubbleToIonicPostMessage.IFRAME_ON_LOAD:
              this.iframeLoaded$.next(true);
              break;
            case BubbleToIonicPostMessage.IFRAME_BACK_BUTTON_CLICKED:
              this.navController.back();
              break;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
