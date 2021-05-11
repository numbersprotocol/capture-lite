import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, ReplaySubject } from 'rxjs';
import { catchError, concatMap, first, shareReplay, tap } from 'rxjs/operators';
import { isNonNullable } from '../../utils/rx-operators/rx-operators';
import { DiaBackendAuthService } from '../dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../error/error.service';
import { NetworkService } from '../network/network.service';

@UntilDestroy()
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  readonly networkConnected$ = this.networkService.connected$;

  private readonly avatarInput$ = new ReplaySubject<HTMLInputElement>(1);

  @ViewChild('input')
  set avatarInput(value: ElementRef<HTMLInputElement> | undefined) {
    if (value) this.avatarInput$.next(value.nativeElement);
  }

  readonly avatar$ = this.diaBackendAuthService.avatar$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly networkService: NetworkService,
    private readonly errorService: ErrorService
  ) {}

  selectAvatar() {
    return this.avatarInput$
      .pipe(
        first(),
        tap(inputElement => inputElement.click()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  uploadAvatar(event: Event) {
    return of((event.target as HTMLInputElement | null)?.files?.item(0))
      .pipe(
        isNonNullable(),
        concatMap(picture =>
          this.diaBackendAuthService.uploadAvatar$({ picture })
        ),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
