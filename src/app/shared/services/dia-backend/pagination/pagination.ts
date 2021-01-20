import { PaginatedResponse } from './paginated-response';

export class Pagination<T> implements PaginatedResponse<T> {
  count: number;
  previous: string | undefined;
  next: string | undefined;
  results: T[];
  constructor(paginatedResponse: PaginatedResponse<T>) {
    this.count = paginatedResponse.count;
    this.previous = paginatedResponse.previous ?? undefined;
    this.next = paginatedResponse.next ?? undefined;
    this.results = paginatedResponse.results;
  }
}
