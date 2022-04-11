import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
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
    private readonly navController: NavController
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
    PreviewVideo.playFullScreenFromRemote({ url: this.mediaFile.url });
    PreviewVideo.addListener('iosPlayerDismissed', (_info: any) => {
      // eslint-disable-next-line no-console
      console.log('ITS WORKING');
      this.navController.back();
    });
  }

  ngOnDestroy(): void {
    PreviewVideo.stopFullScreen();
    // TODO: check if .remove() really get called
    this.onIOSPlayerDismissedListener?.remove();
  }

  dismiss() {
    PreviewVideo.stopFullScreen();
    this.navController.back();
  }
}
