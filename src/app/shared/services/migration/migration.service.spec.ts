import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { MigrationService } from './migration.service';

describe('MigrationService', () => {
  let service: MigrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(MigrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
