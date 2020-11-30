import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { PreferenceManager } from './preference-manager.service';

describe('PreferenceManager', () => {
  let manager: PreferenceManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    manager = TestBed.inject(PreferenceManager);
  });

  it('should be created', () => expect(manager).toBeTruthy());

  it('should get new preference with new ID', () => {
    const id = 'newId';
    expect(manager.getPreferences(id)).toBeTruthy();
  });

  it('should get same preference with same ID', () => {
    const id = 'id';
    expect(manager.getPreferences(id)).toBe(manager.getPreferences(id));
  });
});
