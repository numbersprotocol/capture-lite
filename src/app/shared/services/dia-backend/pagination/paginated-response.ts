export interface PaginatedResponse<T> {
  count: number;
  previous: string | null | undefined;
  next: string | null | undefined;
  results: T[];
}
