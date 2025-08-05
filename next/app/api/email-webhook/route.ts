import { NextRequest, NextResponse } from 'next/server';
import { emailWebhookProcessor } from '@/lib/email-webhook-processor';

// Enhanced webhook endpoint with Redis caching for receiving emails
export async function POST(request: NextRequest) {
  return await emailWebhookProcessor.processEmailWebhook(request);
}

// GET endpoint for webhook health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: 'email-webhook',
    timestamp: new Date().toISOString()
  });
}