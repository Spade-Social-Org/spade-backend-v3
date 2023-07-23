import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { PaginationMeta, MetaResponse } from './interface';

export const PaginationOptions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FindManyOptions => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 15;

    const take = perPage;
    const skip = (page - 1) * perPage;

    return { take, skip };
  },
);

export function getPaginationMeta(
  total: number,
  currentPage: number,
  perPage: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage);

  return {
    currentPage,
    perPage,
    total,
    totalPages,
  };
}

export function generateMetaResponse(
  count: number,
  currentPage: number,
  perPage: number,
): MetaResponse {
  const totalPages = Math.ceil(count / perPage);

  return {
    first: currentPage === 1 ? null : 1,
    last: totalPages,
    prev: currentPage === 1 ? null : currentPage - 1,
    next: currentPage === totalPages ? null : currentPage + 1,
    currentPage,
    previousPage: currentPage <= 1 ? null : currentPage - 1,
    lastPage: totalPages,
    perPage,
    total: count,
  };
}
