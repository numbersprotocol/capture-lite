import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, ReplaySubject } from 'rxjs';
import { concatMap, first, shareReplay, tap } from 'rxjs/operators';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { DiaBackendAuthService } from '../../services/dia-backend/auth/dia-backend-auth.service';

@UntilDestroy()
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  private readonly avatarInput$ = new ReplaySubject<HTMLInputElement>(1);

  @ViewChild('input')
  set avatarInput(value: ElementRef<HTMLInputElement> | undefined) {
    if (value) this.avatarInput$.next(value.nativeElement);
  }

  readonly avatar$ = this.diaBackendAuthService.avatar$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly diaBackendAuthService: DiaBackendAuthService) {}

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
        untilDestroyed(this)
      )
      .subscribe();
  }
}
