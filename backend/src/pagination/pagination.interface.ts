export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  total?: number;
}