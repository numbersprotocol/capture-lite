// tslint:disable: no-implicit-dependencies prefer-function-over-method
import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo() {
    return browser.get('/');
  }

  async getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}
