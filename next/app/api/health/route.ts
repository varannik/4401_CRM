import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const healthChecks: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {}
    };

    // Database health check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthChecks.services.database = { status: 'healthy', type: 'postgresql' };
    } catch (error) {
      healthChecks.services.database = { 
        status: 'unhealthy', 
        type: 'postgresql',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      healthChecks.status = 'degraded';
    }

    // Redis health check
    try {
      const redisHealth = await checkRedisHealth();
      healthChecks.services.redis = { 
        status: redisHealth.status, 
        type: 'azure-redis-cache',
        lastCheck: redisHealth.timestamp
      };
      if (redisHealth.status !== 'healthy') {
        healthChecks.status = 'degraded';
        healthChecks.services.redis.error = redisHealth.error;
      }
    } catch (error) {
      healthChecks.services.redis = { 
        status: 'unhealthy', 
        type: 'azure-redis-cache',
        error: error instanceof Error ? error.message : 'Redis connection failed'
      };
      healthChecks.status = 'degraded';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    healthChecks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`
    };

    const statusCode = healthChecks.status === 'ok' ? 200 : 
                      healthChecks.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthChecks, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
} 