import { Observable } from 'rxjs';

export interface Preferences {
  readonly id: string;
  getBoolean$(key: string, defaultValue?: boolean): Observable<boolean>;
  getNumber$(key: string, defaultValue?: number): Observable<number>;
  getString$(key: string, defaultValue?: string): Observable<string>;
  getBoolean(key: string, defaultValue?: boolean): Promise<boolean>;
  getNumber(key: string, defaultValue?: number): Promise<number>;
  getString(key: string, defaultValue?: string): Promise<string>;
  setBoolean(key: string, value: boolean): Promise<boolean>;
  setNumber(key: string, value: number): Promise<number>;
  setString(key: string, value: string): Promise<string>;
  clear(): Promise<Preferences>;
}
