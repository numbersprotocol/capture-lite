import { Preferences } from './preferences';

const enum RepositoryName {
  Language = 'language',
  DefaultInformationProvider = 'defaultInformationProvider',
  DefaultSignatureProvider = 'defaultSignatureProvider'
}

export class PreferenceManager {

  static readonly LANGUAGE_PREF = new Preferences(RepositoryName.Language);
  static readonly DEFAULT_INFORMATION_PROVIDER_PREF = new Preferences(RepositoryName.DefaultInformationProvider);
  static readonly DEFAULT_SIGNATURE_PROVIDER_PREF = new Preferences(RepositoryName.DefaultSignatureProvider);
}
