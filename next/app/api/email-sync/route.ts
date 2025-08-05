import { NextRequest, NextResponse } from 'next/server';

// Manual email sync disabled - using dedicated email system instead
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Manual email sync disabled',
    message: 'This CRM now uses automatic email processing via crm@4401.earth. No manual sync required.',
    instructions: [
      'Forward emails to crm@4401.earth for automatic processing',
      'Or set up email rules to automatically forward external emails',
      'Check /settings/email-integration for setup instructions'
    ],
    redirectTo: '/settings/email-integration'
  }, { status: 410 }); // 410 Gone - feature permanently disabled
}

// GET endpoint for checking sync status (now returns dedicated email status)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasEmailPermissions: false,
    message: 'Using dedicated email system. Forward emails to crm@4401.earth for automatic processing.',
    systemType: 'dedicated_email',
    emailAddress: 'crm@4401.earth',
    status: 'active'
  });
}