import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };

    // You can add more health checks here:
    // - Database connectivity
    // - External service availability
    // - Memory usage, etc.

    return NextResponse.json(healthCheck, { status: 200 });
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