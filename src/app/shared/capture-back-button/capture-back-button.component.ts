import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-capture-back-button',
  templateUrl: './capture-back-button.component.html',
  styleUrls: ['./capture-back-button.component.scss'],
})
export class CaptureBackButtonComponent {
  constructor(private readonly navController: NavController) {}

  /**
   * WORKAROUND: capture app ionic (angular) navigationTrigger
   * is `imperative`, however capture app iframe navigationTrigger
   * is `popstate` (`popstate` because iframe uses `window.history.back()`).
   *
   * Using `imperative` with `popstate` together
   * results to unexpected navigation behavior. Since we can
   * not change how capture app iframe navigatioin works we need
   * to change capture app ionic's navigation to `popstate`.
   */
  back() {
    /**
     * When capture app iframe navigates back it uses `windows.history.back()`.
     * Angular provides `NavController.back()` method that uses
     * `windows.history.back()` under the hood, which is also featuring a back animation.
     */
    this.navController.back();
  }
}
