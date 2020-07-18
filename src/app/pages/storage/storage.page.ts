import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CameraService } from 'src/app/services/camera/camera.service';
import { ProofRepository } from 'src/app/services/data/proof/proof-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-storage',
  templateUrl: 'storage.page.html',
  styleUrls: ['storage.page.scss'],
})
export class StoragePage {

  readonly proofList$ = this.proofRepository.getAll$();

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly cameraService: CameraService
  ) { }

  capture() {
    this.cameraService.capture$().pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
