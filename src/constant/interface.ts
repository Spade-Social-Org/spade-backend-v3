export interface PaginationData {
  total: number;

  perPage: number;

  currentPage: number;
  totalPages: number;
  first: string;
  last: string;
  prev: string;
  next: string;
}
