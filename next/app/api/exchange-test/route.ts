import { NextRequest, NextResponse } from 'next/server';

// Exchange integration disabled - using dedicated email system instead
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Exchange integration disabled',
    message: 'This CRM now uses direct email processing via crm@4401.earth. No Exchange integration required.',
    redirectTo: '/settings/email-integration'
  }, { status: 410 }); // 410 Gone - feature permanently disabled
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Exchange integration disabled', 
    message: 'This CRM now uses direct email processing via crm@4401.earth. No Exchange integration required.',
    redirectTo: '/settings/email-integration'
  }, { status: 410 }); // 410 Gone - feature permanently disabled
}