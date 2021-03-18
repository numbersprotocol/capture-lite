export interface PaginatedResponse<T> {
  readonly count: number;
  readonly previous: string | null | undefined;
  readonly next: string | null | undefined;
  readonly results: T[];
}
