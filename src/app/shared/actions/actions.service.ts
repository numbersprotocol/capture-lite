import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BUBBLE_DB_URL } from '../dia-backend/secret';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  constructor(private readonly httpClient: HttpClient) {}

  getActions$() {
    return defer(() =>
      this.httpClient
        .get<GetActionsResponse<Action>>(`${BUBBLE_DB_URL}/api/1.1/obj/action`)
        .pipe(map(response => response.response.results))
    );
  }

  getParams$(ids: string[]) {
    return defer(() =>
      forkJoin(
        ids.map(id =>
          this.httpClient
            .get<GetParamResponse>(`${BUBBLE_DB_URL}/api/1.1/obj/param/${id}`)
            .pipe(map(response => response.response))
        )
      )
    );
  }

  send$(url: string, body: any) {
    return this.httpClient.post(url, body);
  }
}

export interface Action {
  readonly base_url_text: string;
  readonly banner_image_url_text: string;
  readonly description_text: string;
  readonly price_number: number;
  readonly title_text: string;
  readonly params_list_custom_param: string[];
}

export interface Param {
  readonly label_text: string;
  readonly name_text: string;
  readonly type_text: string;
  readonly placeholder_text: string;
  readonly default_value_text: string;
}

export interface GetActionsResponse<T> {
  readonly response: {
    readonly cursor: number;
    readonly results: T[];
    readonly remaining: number;
    readonly count: number;
  };
}

export interface GetParamResponse {
  readonly response: Param;
}
