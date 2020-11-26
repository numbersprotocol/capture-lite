// tslint:disable-next-line: no-implicit-dependencies
import { browser, by, element } from 'protractor';

export class AppPage {
  // tslint:disable-next-line: prefer-function-over-method
  async navigateTo() {
    return browser.get('/');
  }

  // tslint:disable-next-line: prefer-function-over-method
  async getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}
