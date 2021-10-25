import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  private readonly BASE_URL =
    '***REMOVED***';

  constructor(private readonly httpClient: HttpClient) {}

  actions$() {
    return defer(() =>
      this.httpClient
        .get<GetActionsResponse<Action>>(`${this.BASE_URL}/api/1.1/obj/action`)
        .pipe(map(response => response.response.results))
    );
  }
}

export interface Action {
  readonly base_url_text: string;
  readonly banner_image_url_text: string;
  readonly description_text: string;
  readonly price_number: number;
  readonly title_text: string;
}

export interface GetActionsResponse<T> {
  readonly response: {
    readonly cursor: number;
    readonly results: T[];
    readonly remaining: number;
    readonly count: number;
  };
}
