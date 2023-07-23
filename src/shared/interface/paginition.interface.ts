export interface PaginationMeta {
  /**
   * The current page of the set of items being retrieved.
   */
  currentPage: number;

  /**
   * The number of items to display per page.
   */
  perPage: number;

  /**
   * The total number of items that exist across all pages.
   */
  total: number;

  /**
   * The total number of pages needed to display all items.
   */
  totalPages: number;
}

export interface MetaResponse {
  /**
   * The number for the first page of the paginated result.
   */
  first: number | null;

  /**
   * The number for the last page of the paginated result.
   */
  last: number | null;

  /**
   * The number for the previous page of the paginated result.
   */
  prev: number | null;

  /**
   * The number for the next page of the paginated result.
   */
  next: number | null;

  /**
   * The current page number in the paginated result.
   */
  currentPage: number;

  /**
   * The page number for the previous page in the paginated result.
   */
  previousPage: number | null;

  /**
   * The page number for the last page in the paginated result.
   */
  lastPage: number;

  /**
   * The number of items per page in the paginated result.
   */
  perPage: number;

  /**
   * The total number of items across all pages in the paginated result.
   */
  total: number;
}

export interface IPaginationOptions {
  /**
   * Offset (paginated) where from entities should be taken.
   */
  take: number;
  /**
   * Limit (paginated) - max number of entities should be taken.
   */
  skip: number;
}

export interface PaginationResult<T> {
  /**
   * The array of items on the current page.
   */
  items: T[];

  /**
   * The total number of items across all pages.
   */
  count: number;
}
