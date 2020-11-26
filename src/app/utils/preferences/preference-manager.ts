import { Preferences } from './preferences';

const enum RepositoryName {
  Language = 'language',
  CapacitorProvider = 'capacitorProvider',
  WebCryptoApiProvider = 'webCryptoApiProvider',
  NumbersStoragePublisher = 'numbersStoragePublisher',
}

export class PreferenceManager {
  static readonly LANGUAGE_PREF = new Preferences(RepositoryName.Language);
  static readonly CAPACITOR_PROVIDER_PREF = new Preferences(
    RepositoryName.CapacitorProvider
  );
  static readonly WEB_CRYPTO_API_PROVIDER_PREF = new Preferences(
    RepositoryName.WebCryptoApiProvider
  );
  static readonly NUMBERS_STORAGE_PUBLISHER_PREF = new Preferences(
    RepositoryName.NumbersStoragePublisher
  );
}
