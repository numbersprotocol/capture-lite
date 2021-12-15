import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendWorkflowService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  getWorkflowById$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWorkflow>(
          `${BASE_URL}/api/v3/workflows/${id}/`,
          { headers }
        );
      })
    );
  }
}

export interface DiaBackendWorkflow {
  readonly id: string;
  readonly name: string;
  readonly status: 'success' | 'failure' | 'pending' | 'unknown';
  readonly description: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly last_executed_at: string;
  readonly completed_at: string | null;
}
