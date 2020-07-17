import { Injectable } from '@angular/core';
import { Preferences } from './preferences';

enum RepositoryName {
  Language = 'language'
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  static languagePref = new Preferences(RepositoryName.Language);
}
