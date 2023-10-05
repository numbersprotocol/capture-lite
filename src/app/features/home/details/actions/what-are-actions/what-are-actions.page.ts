import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BUBBLE_IFRAME_URL } from '../../../../../shared/dia-backend/secret';
import { BubbleToIonicPostMessage } from '../../../../../shared/iframe/iframe';
import { NetworkService } from '../../../../../shared/network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-what-are-actions',
  templateUrl: './what-are-actions.page.html',
  styleUrls: ['./what-are-actions.page.scss'],
})
export class WhatAreActionsPage {
  readonly networkConnected$ = this.networkService.connected$;
  readonly iframeUrl = `${BUBBLE_IFRAME_URL}/what_are_actions`;
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