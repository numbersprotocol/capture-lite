import { TestBed } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { BlockingActionService } from './blocking-action.service';

describe('BlockingActionService', () => {
  let service: BlockingActionService;
  let htmlIonLoadingElementSpy: jasmine.SpyObj<HTMLIonLoadingElement>;
  const value1 = 8;
  const value2 = 9;
  const action$ = of(value1, value2);
  const errorMessage = 'error!';
  const errorAction$ = action$.pipe(
    map(() => {
      throw new Error(errorMessage);
    })
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(BlockingActionService);
    const loadingController = TestBed.inject(LoadingController);

    htmlIonLoadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', {
      present: new Promise<void>(resolve => resolve()),
      dismiss: new Promise<boolean>(resolve => resolve(true)),
    });

    spyOn(loadingController, 'create').and.resolveTo(htmlIonLoadingElementSpy);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should return the same expected value to the action', done => {
    service
      .run$(action$)
      .pipe(toArray())
      .subscribe(result => {
        expect(result).toEqual([value1, value2]);
        done();
      });
  });

  it('should throw error if action has error', done => {
    service.run$(errorAction$).subscribe({
      error: (err: unknown) => {
        if (err instanceof Error) {
          expect(err.message).toEqual(errorMessage);
          done();
        }
      },
    });
  });

  it('should dismiss the blocking dialog when action is completed', done => {
    const subscription = service.run$(action$).subscribe({
      complete: () => {
        subscription.unsubscribe();
        expect(htmlIonLoadingElementSpy.dismiss).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should dismiss the blocking dialog when action throws errors', done => {
    const subscription = service.run$(errorAction$).subscribe({
      error: () => {
        subscription.unsubscribe();
        expect(htmlIonLoadingElementSpy.dismiss).toHaveBeenCalled();
        done();
      },
    });
  });

  // TODO: See #263.
  // it('should block events from physical back button on Android', () => {});
});
