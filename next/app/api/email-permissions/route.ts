import { NextRequest, NextResponse } from 'next/server';

// Email permissions check disabled - using dedicated email system instead
export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasEmailPermissions: false,
    message: 'Exchange email permissions no longer required. Using direct email processing via crm@4401.earth.',
    redirectTo: '/settings/email-integration',
    systemStatus: 'dedicated_email_active'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Email permissions setup disabled',
    message: 'No permissions required. Forward emails to crm@4401.earth for automatic processing.',
    redirectTo: '/settings/email-integration'
  }, { status: 410 }); // 410 Gone - feature permanently disabled
}