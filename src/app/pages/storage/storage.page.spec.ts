import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { StoragePage } from './storage.page';

describe('StoragePage', () => {
  let component: StoragePage;
  let fixture: ComponentFixture<StoragePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StoragePage],
      imports: [
        RouterTestingModule,
        getTranslocoModule(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatGridListModule,
        MatCardModule,
        MatSidenavModule,
        MatListModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StoragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
