import { JoyrideModule } from 'ngx-joyride';

export function getJoyrideModuleForRoot() {
  return JoyrideModule.forRoot();
}

export function getJoyrideModuleForChild() {
  return JoyrideModule.forChild();
}
