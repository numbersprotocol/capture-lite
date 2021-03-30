import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedTestingModule } from '../../../../../../shared/shared-testing.module';
import { FriendInvitationDialogComponent } from './friend-invitation-dialog.component';

describe('FriendInvitationDialogComponent', () => {
  let component: FriendInvitationDialogComponent;
  let fixture: ComponentFixture<FriendInvitationDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FriendInvitationDialogComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(FriendInvitationDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
