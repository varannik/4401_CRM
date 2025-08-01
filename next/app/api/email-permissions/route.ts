import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasEmailPermissions } from '@/lib/microsoft-graph';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    const hasPermissions = await hasEmailPermissions();
    const currentScopes = session.scope?.split(' ') || [];
    
    return NextResponse.json({
      hasEmailPermissions: hasPermissions,
      currentScopes,
      requiredScopes: ['Mail.Read', 'Mail.ReadBasic', 'Calendars.Read'],
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    });
    
  } catch (error) {
    console.error('Permission check failed:', error);
         return NextResponse.json(
       { 
         error: 'Failed to check permissions',
         message: error instanceof Error ? error.message : 'Unknown error'
       },
       { status: 500 }
     );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Generate incremental consent URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const authUrl = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize?` +
      new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: `${baseUrl}/api/auth/callback/azure-ad`,
        scope: 'openid profile email User.Read Mail.Read Mail.ReadBasic Calendars.Read offline_access',
        state: JSON.stringify({ 
          type: 'email_consent',
          userId: session.user.id,
          returnTo: '/settings/email-integration'
        }),
        login_hint: session.user.email,
        prompt: 'consent' // Force consent for new scopes
      });
    
    return NextResponse.json({
      authUrl,
      message: 'Redirect to this URL to grant email permissions'
    });
    
  } catch (error) {
    console.error('Failed to generate consent URL:', error);
         return NextResponse.json(
       { 
         error: 'Failed to generate authorization URL',
         message: error instanceof Error ? error.message : 'Unknown error'
       },
       { status: 500 }
     );
  }
} 