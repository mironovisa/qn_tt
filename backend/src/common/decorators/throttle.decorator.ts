import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const AuthThrottle = () =>
  applyDecorators(
    Throttle({ default: { limit: 5, ttl: 60000 } })
  );

export const CrudThrottle = () =>
  applyDecorators(
    Throttle({ default: { limit: 20, ttl: 60000 } })
  );

export const ReadThrottle = () =>
  applyDecorators(
    Throttle({ default: { limit: 60, ttl: 60000 } })
  );