import { Controller, Get } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

collectDefaultMetrics();

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Returns the current health status of the API, including uptime and timestamp. Used for monitoring and load balancer health checks.'
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy and running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-01T09:00:00.000Z' },
        uptime: { type: 'number', example: 3600.123, description: 'Server uptime in seconds' }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'Prometheus metrics',
    description: 'Returns Prometheus-compatible metrics for monitoring. Includes HTTP request metrics, system metrics, and custom application metrics.'
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics in text format',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: '# HELP http_requests_total Total number of HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",route="/health",status_code="200"} 1\n'
        }
      }
    }
  })
  async getMetrics() {
    return register.metrics();
  }
}