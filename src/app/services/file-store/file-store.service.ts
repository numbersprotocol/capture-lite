import { Inject, Injectable } from '@angular/core';
import { FilesystemPlugin } from '@capacitor/core';
import { FILESYSTEM_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';

@Injectable({
  providedIn: 'root',
})
export class FileStore {
  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin
  ) {}
}
