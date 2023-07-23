import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const page = Number(value.page) > 0 ? Number(value.page) : 1;
    value.take = Number(value.limit) > 0 ? Number(value.limit) : 15;
    value.skip = (page - 1) * value.take;
    return value;
  }
}
