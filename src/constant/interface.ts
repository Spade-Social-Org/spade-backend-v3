import { BookmarkEnum, LikeEnum } from './ModelEnums';

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

export interface ILike {
  postId: number;
  userId: number;
  action: LikeEnum;
}
export interface IBookmark {
  postId: number;
  userId: number;
  action: BookmarkEnum;
}
