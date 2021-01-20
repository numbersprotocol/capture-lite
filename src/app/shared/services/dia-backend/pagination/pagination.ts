import { PaginatedResponse } from './paginated-response';

export class Pagination<T> implements PaginatedResponse<T> {
  readonly count: number;
  readonly previous: string | undefined;
  readonly next: string | undefined;
  readonly results: T[];
  constructor(paginatedResponse: PaginatedResponse<T>) {
    this.count = paginatedResponse.count;
    this.previous = paginatedResponse.previous ?? undefined;
    this.next = paginatedResponse.next ?? undefined;
    this.results = paginatedResponse.results;
  }
}
