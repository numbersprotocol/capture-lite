// tslint:disable-next-line: no-implicit-dependencies
import { browser, by, element } from 'protractor';

export class AppPage {
  async navigateTo() {
    return browser.get('/');
  }

  async getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}
