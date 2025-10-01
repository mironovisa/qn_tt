import { Injectable, Logger } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from './pagination.dto';
import { PaginatedResult } from './pagination.interface';

@Injectable()
export class PaginationService {
  private readonly logger = new Logger(PaginationService.name);

  async paginate<T extends { id: string; createdAt: Date }>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
    alias: string = 'entity',
  ): Promise<PaginatedResult<T>> {
    this.logger.debug(`Paginate called with: ${JSON.stringify(paginationDto)}, alias: ${alias}`);
    
    const { cursor, limit = 10 } = paginationDto;

    if (cursor) {
      queryBuilder.andWhere(`${alias}.id < :cursor`, { cursor });
      this.logger.debug(`Applied cursor filter: ${cursor}`);
    }

    queryBuilder
      .orderBy(`${alias}.createdAt`, 'DESC')
      .addOrderBy(`${alias}.id`, 'DESC')
      .limit(limit + 1);

    const items = await queryBuilder.getMany();
    this.logger.debug(`Fetched ${items.length} items (limit + 1 = ${limit + 1})`);
    
    const hasMore = items.length > limit;
    
    if (hasMore) {
      items.pop();
    }

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : undefined;
 const prevCursor = cursor || undefined;

    this.logger.debug(`Returning: ${items.length} items, nextCursor: ${nextCursor}, prevCursor: ${prevCursor}`);

    return {
      data: items,
      nextCursor,
      prevCursor,
    };
  }
}