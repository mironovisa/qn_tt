import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PaginationDto } from './pagination.dto';

const logger = new Logger('PaginationDecorator');

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = request.query;

    logger.debug(`Raw query params: ${JSON.stringify(query)}`);

    const paginationDto = new PaginationDto();
    
    if (query.cursor && typeof query.cursor === 'string') {
      paginationDto.cursor = query.cursor;
      logger.debug(`Set cursor: ${paginationDto.cursor}`);
    }
    
    if (query.limit) {
      const limit = parseInt(query.limit as string, 10);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
        paginationDto.limit = limit;
        logger.debug(`Set limit: ${paginationDto.limit}`);
      }
    }

    logger.debug(`Final pagination DTO: ${JSON.stringify(paginationDto)}`);
    return paginationDto;
  },
);

export { PaginationDto };