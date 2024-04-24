import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CaptureTabService {
  private readonly segmentSubject$ = new BehaviorSubject<CaptureTabSegments>(
    CaptureTabSegments.VERIFIED
  );

  segment$ = this.segmentSubject$
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  focusTo(segment: CaptureTabSegments): void {
    this.segmentSubject$.next(segment);
  }
}

export enum CaptureTabSegments {
  VERIFIED = 'VERIFIED',
  DRAFT = 'DRAFT',
}
