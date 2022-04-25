import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { PreviewVideo } from '@numbersprotocol/preview-video';
import { GoProFile } from '../go-pro-media-file';

@Component({
  selector: 'app-go-pro-media-viewer-with-native-player',
  templateUrl: './go-pro-media-viewer-with-native-player.component.html',
  styleUrls: ['./go-pro-media-viewer-with-native-player.component.scss'],
})
export class GoProMediaViewerWithNativePlayerComponent
  implements OnInit, OnDestroy
{
  mediaFile: GoProFile | undefined;

  onIOSPlayerDismissedListener?: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navController: NavController,
    private readonly platform: Platform
  ) {
    this.route.queryParams.subscribe(_ => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state) {
        this.mediaFile = state.goProMediaFile;
      }
    });
  }

  ngOnInit(): void {
    if (!this.mediaFile?.url) return;
    if (this.platform.is('hybrid')) {
      PreviewVideo.playFullScreenFromRemote({ url: this.mediaFile.url });
      this.onIOSPlayerDismissedListener = PreviewVideo.addListener(
        'iosPlayerDismissed',
        (_info: any) => this.navController.back()
      );
    }
  }

  ngOnDestroy(): void {
    if (this.platform.is('hybrid')) {
      PreviewVideo.stopFullScreen();
      this.onIOSPlayerDismissedListener?.remove();
    }
  }

  dismiss() {
    if (this.platform.is('hybrid')) {
      PreviewVideo.stopFullScreen();
    }
    this.navController.back();
  }
}
