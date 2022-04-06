import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BUBBLE_DB_URL } from '../../dia-backend/secret';

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
    if (ids.length === 0) return of([]);
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
  readonly action_cost_number: number;
  readonly banner_image_url_text: string;
  readonly base_url_text: string;
  readonly description_text: string;
  readonly params_list_custom_param1?: string[];
  readonly title_text: string;
  readonly network_app_id_text: string;
  readonly ext_action_destination_text?: string;
  readonly hide_capture_after_execution_boolean?: boolean;
}

export interface Param {
  readonly default_values_list_text: string[];
  readonly description_text: string;
  readonly display_text_text: string;
  readonly name_text: string;
  readonly placeholder_text: string;
  readonly type_text: 'number' | 'text' | 'dropdown';
  readonly user_input_boolean: boolean;
  readonly max_number: number;
  readonly min_number: number;
  readonly optional_boolean?: boolean;
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

export interface BubbleCreateNewThingResponse {
  id: string;
  status: string;
}
